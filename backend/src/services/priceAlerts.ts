// Avisos por correo cuando baja un producto que alguien guardó en favoritos.
// 1. queuePriceDropAlerts: lo llama el scrape al detectar una bajada; deja filas "pending".
// 2. sendPendingPriceAlerts: corre una vez al día (scrape:all) y manda un correo por usuario.
// Reglas en utils/priceAlerts; detalles en docs/PRICE_ALERTS.md.
import { Types } from "mongoose";
import Wishlist from "../models/Wishlist";
import User from "../models/User";
import Product from "../models/Product";
import PriceAlert from "../models/PriceAlert";
import config from "../utils/config";
import logger from "../utils/logger";
import { getMailerMode, sendEmail, type MailerMode } from "../utils/mailer";
import { getEmailTokenSecret, signUnsubscribeToken } from "../utils/emailTokens";
import { getTrackedPrice } from "../utils/priceTracking";
import {
  ALERT_MAX_AGE_DAYS,
  ALERT_MAX_ATTEMPTS,
  DIGEST_MAX_ITEMS,
  buildDigest,
  isAlertableDrop,
  type DigestProduct,
  type PendingAlert,
} from "../utils/priceAlerts";
import { renderPriceDropEmail } from "../emails/priceDropEmail";
import type { PriceChange } from "../scrapers";

const DAY_MS = 24 * 60 * 60 * 1000;
const DUPLICATE_KEY = 11000;

/** Usuarios que tienen el producto en favoritos (misma regla que toggleFavorite). */
async function findFavoritedBy(productId: Types.ObjectId): Promise<Types.ObjectId[]> {
  const lists = await Wishlist.find(
    { "items.productId": productId, $or: [{ isSystem: false }, { isDefault: true }] },
    { userId: 1 }
  ).lean();
  const unique = new Map(lists.map((l: any) => [String(l.userId), l.userId as Types.ObjectId]));
  return [...unique.values()];
}

/**
 * Deja avisos pendientes para una bajada de precio. Devuelve cuántos creó.
 * No avisa si la persona apagó los avisos o si ya le avisamos de un precio igual o menor.
 */
export async function queuePriceDropAlerts(
  change: PriceChange,
  availability: { isActive?: boolean | null; inStock?: boolean | null },
  now = new Date()
): Promise<number> {
  if (!isAlertableDrop(change.previousPrice, change.newPrice, availability)) return 0;

  const favoritedBy = await findFavoritedBy(change.productId);
  if (!favoritedBy.length) return 0;

  const users = await User.find(
    { _id: { $in: favoritedBy }, "notifications.priceDrops": { $ne: false } },
    { _id: 1 }
  ).lean();

  let queued = 0;
  for (const { _id: userId } of users) {
    const lastSent = await PriceAlert.findOne(
      { user: userId, product: change.productId, status: "sent" },
      { newPrice: 1 },
      { sort: { sentAt: -1 } }
    ).lean();
    if (lastSent && change.newPrice >= lastSent.newPrice) continue;

    try {
      await PriceAlert.create({
        user: userId,
        product: change.productId,
        oldPrice: change.previousPrice,
        newPrice: change.newPrice,
        currency: change.currency,
        createdAt: now,
      });
      queued++;
    } catch (err: any) {
      if (err?.code !== DUPLICATE_KEY) throw err; // ya había uno pendiente igual
    }
  }
  return queued;
}

export type PriceAlertRunStats = {
  mode: MailerMode;
  blocked?: string;      // por qué no se envió nada
  users: number;
  emailsSent: number;
  emailsFailed: number;
  alertsSent: number;
  alertsSkipped: number;
  alertsExpired: number;
  previewUrls: string[]; // solo con Ethereal
};

/**
 * ¿Podemos mandar alertas? Con Brevo siempre. Con Ethereal (correos de prueba) solo en
 * desarrollo: si no, las alertas de usuarios reales quedarían "enviadas" sin llegar.
 */
export function getSendBlocker(): string | null {
  if (getMailerMode() !== "brevo" && (config.IS_PRODUCTION_DB || process.env.CI === "true")) {
    return "falta BREVO_API_KEY: las alertas quedan pendientes";
  }
  if (!getEmailTokenSecret()) return "falta EMAIL_TOKEN_SECRET: sin él no hay link para desuscribirse";
  return null;
}

const absoluteUrl = (src: string | undefined) =>
  !src ? undefined : src.startsWith("/") ? `${config.FRONTEND_URL}${src}` : src;

async function loadDigestProducts(ids: string[]): Promise<Map<string, DigestProduct>> {
  const products = await Product.find(
    { _id: { $in: ids } },
    { title: 1, brand: 1, images: 1, price: 1, variants: 1, isActive: 1, inStock: 1, priceStats: 1 }
  ).populate("brand", "name").lean();

  return new Map(products.map((p: any) => {
    const currentPrice = getTrackedPrice(p.variants, p.price)?.price ?? null;
    return [String(p._id), {
      id: String(p._id),
      title: p.title,
      brandName: p.brand?.name,
      imageUrl: absoluteUrl(p.images?.[0]?.src),
      isActive: p.isActive,
      inStock: p.inStock,
      currentPrice,
      isLowest30d: !!p.priceStats?.isLowest30d && p.priceStats.current === currentPrice,
    }];
  }));
}

/** Envía los avisos pendientes: un correo por usuario con todo lo que bajó. */
export async function sendPendingPriceAlerts(now = new Date()): Promise<PriceAlertRunStats> {
  const stats: PriceAlertRunStats = {
    mode: getMailerMode(), users: 0, emailsSent: 0, emailsFailed: 0,
    alertsSent: 0, alertsSkipped: 0, alertsExpired: 0, previewUrls: [],
  };

  const blocker = getSendBlocker();
  if (blocker) {
    logger.info(`Avisos de precio sin enviar: ${blocker}`);
    return { ...stats, blocked: blocker };
  }

  const expired = await PriceAlert.updateMany(
    { status: { $in: ["pending", "failed"] }, createdAt: { $lt: new Date(now.getTime() - ALERT_MAX_AGE_DAYS * DAY_MS) } },
    { $set: { status: "skipped", skipReason: "expired" } }
  );
  stats.alertsExpired = expired.modifiedCount;

  const alerts = await PriceAlert.find({
    $or: [{ status: "pending" }, { status: "failed", attempts: { $lt: ALERT_MAX_ATTEMPTS } }],
  }).lean();

  const byUser = new Map<string, typeof alerts>();
  for (const alert of alerts) {
    const key = String(alert.user);
    byUser.set(key, [...(byUser.get(key) ?? []), alert]);
  }

  const markSkipped = async (ids: string[], reason: string) => {
    if (!ids.length) return;
    await PriceAlert.updateMany({ _id: { $in: ids } }, { $set: { status: "skipped", skipReason: reason } });
    stats.alertsSkipped += ids.length;
  };

  for (const [userId, userAlerts] of byUser) {
    const allIds = userAlerts.map((a) => String(a._id));
    const user = await User.findById(userId, { email: 1, username: 1, notifications: 1 }).lean();
    if (!user?.email) { await markSkipped(allIds, "no-user"); continue; }
    if (user.notifications?.priceDrops === false) { await markSkipped(allIds, "opted-out"); continue; }

    const products = await loadDigestProducts([...new Set(userAlerts.map((a) => String(a.product)))]);
    const { items, skipped } = buildDigest(userAlerts as PendingAlert[], products);
    for (const s of skipped) await markSkipped(s.alertIds, s.reason);
    if (!items.length) continue;

    stats.users++;
    const shown = items.slice(0, DIGEST_MAX_ITEMS);
    const includedIds = items.flatMap((item) => item.alertIds);
    const token = signUnsubscribeToken(userId);
    const unsubscribeUrl = `${config.FRONTEND_URL}/desuscribir?token=${encodeURIComponent(token)}`;
    const email = renderPriceDropEmail({
      username: user.username,
      items: shown,
      extraCount: items.length - shown.length,
      frontendUrl: config.FRONTEND_URL,
      unsubscribeUrl,
    });

    // Botón "Anular suscripción" de Gmail/Outlook (RFC 8058): un POST directo al backend.
    const headers = config.PUBLIC_API_URL
      ? {
          "List-Unsubscribe": `<${config.PUBLIC_API_URL}/api/users/unsubscribe/price-drops?token=${encodeURIComponent(token)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined;

    try {
      const result = await sendEmail({ to: user.email, toName: user.username, subject: email.subject, html: email.html, text: email.text, headers });
      if (result.previewUrl) stats.previewUrls.push(result.previewUrl);
      await PriceAlert.updateMany(
        { _id: { $in: includedIds } },
        { $set: { status: "sent", sentAt: now }, $unset: { lastError: 1 }, $inc: { attempts: 1 } }
      );
      stats.emailsSent++;
      stats.alertsSent += includedIds.length;
    } catch (err: any) {
      await PriceAlert.updateMany(
        { _id: { $in: includedIds } },
        { $set: { status: "failed", lastError: String(err?.message ?? err).slice(0, 300) }, $inc: { attempts: 1 } }
      );
      stats.emailsFailed++;
      logger.error(`No se pudo enviar el aviso de precio al usuario ${userId}: ${err?.message ?? err}`);
    }
  }

  return stats;
}
