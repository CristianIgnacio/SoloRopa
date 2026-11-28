// Lectura del historial de precios y recálculo del resumen Product.priceStats.
import { Types } from "mongoose";
import Product from "../models/Product";
import PriceHistory from "../models/PriceHistory";
import { computePriceStats, PRICE_STATS_WINDOW_DAYS, type PricePoint, type PriceStats } from "../utils/priceTracking";

const DAY_MS = 24 * 60 * 60 * 1000;

type ProductId = Types.ObjectId | string;

/** Historial completo de un producto, del más antiguo al más reciente. Son pocas filas: solo cambios. */
export async function getPriceRows(productId: ProductId): Promise<PricePoint[]> {
  return PriceHistory.find(
    { product: productId },
    { _id: 0, price: 1, recordedAt: 1 },
    { sort: { recordedAt: 1 }, lean: true }
  );
}

/** Recalcula y guarda priceStats de un producto. Devuelve el resumen (null si no hay historial). */
export async function refreshPriceStats(productId: ProductId, now = new Date()): Promise<PriceStats | null> {
  const stats = computePriceStats(await getPriceRows(productId), now);
  await Product.updateOne(
    { _id: productId },
    { $set: { priceStats: stats ? { ...stats, computedAt: now } : null } },
    { timestamps: false } // no es un cambio del producto, no debe mover updatedAt
  );
  return stats;
}

/**
 * Recalcula los productos cuya etiqueta "precio más bajo en 30 días" puede cambiar solo
 * por el paso del tiempo: los que cambiaron hace poco o la tienen encendida. Incluye los
 * que aún no tienen priceStats, así la primera corrida rellena todo el catálogo.
 * Pensado para correr una vez al día, después del scrape.
 */
export async function refreshRecentPriceStats(now = new Date()): Promise<number> {
  const since = new Date(now.getTime() - (PRICE_STATS_WINDOW_DAYS + 1) * DAY_MS);
  const ids = await Product.distinct("_id", {
    $or: [
      { "priceStats.lastChangeAt": { $gte: since } },
      { "priceStats.isLowest30d": true },
      { priceStats: { $exists: false } },
    ],
  });

  for (const id of ids) {
    await refreshPriceStats(id, now);
  }
  return ids.length;
}
