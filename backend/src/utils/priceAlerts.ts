// Reglas de los avisos de bajada de precio. Funciones puras, sin BD. Ver docs/PRICE_ALERTS.md.

export const ALERT_MIN_DROP = 0.05;      // bajar al menos un 5%
export const ALERT_MAX_DROP = 0.9;       // más de un 90% suele ser un error de scraping
export const ALERT_MIN_PRICE = 1000;     // un precio menor a $1.000 también
export const ALERT_MAX_AGE_DAYS = 7;     // una alerta pendiente más vieja ya no sirve
export const ALERT_MAX_ATTEMPTS = 3;     // reintentos si el envío falla
export const DIGEST_MAX_ITEMS = 10;      // productos por correo; el resto se resume

export const dropPercent = (oldPrice: number, newPrice: number) =>
  Math.round((1 - newPrice / oldPrice) * 100);

type Availability = { isActive?: boolean | null; inStock?: boolean | null };

/** ¿Este cambio de precio merece un aviso? */
export function isAlertableDrop(previousPrice: number | null | undefined, newPrice: number, product: Availability): boolean {
  if (!previousPrice || previousPrice <= 0) return false; // producto nuevo o sin precio anterior
  if (product.isActive === false || product.inStock === false) return false;
  if (!(newPrice >= ALERT_MIN_PRICE)) return false;
  const drop = 1 - newPrice / previousPrice;
  return drop >= ALERT_MIN_DROP && drop <= ALERT_MAX_DROP;
}

export type PendingAlert = {
  _id: { toString(): string };
  product: { toString(): string };
  oldPrice: number;
  newPrice: number;
};

export type DigestProduct = Availability & {
  id: string;
  title: string;
  brandName?: string;
  imageUrl?: string;
  currentPrice: number | null; // precio "desde" actual (utils/priceTracking)
  isLowest30d: boolean;
};

export type DigestItem = {
  productId: string;
  title: string;
  brandName?: string;
  imageUrl?: string;
  oldPrice: number;
  newPrice: number;
  percent: number;
  isLowest30d: boolean;
  alertIds: string[];
};

export type SkippedAlerts = { alertIds: string[]; reason: "product-missing" | "unavailable" | "price-rose" };

/**
 * Arma el contenido del correo de un usuario a partir de sus alertas pendientes.
 * - Varias alertas del mismo producto se juntan: precio anterior más alto, precio actual.
 * - Se descartan si el producto ya no existe, no está disponible o volvió a subir.
 * - Ordenado por mayor bajada.
 */
export function buildDigest(
  alerts: PendingAlert[],
  products: Map<string, DigestProduct>
): { items: DigestItem[]; skipped: SkippedAlerts[] } {
  const byProduct = new Map<string, PendingAlert[]>();
  for (const alert of alerts) {
    const key = alert.product.toString();
    byProduct.set(key, [...(byProduct.get(key) ?? []), alert]);
  }

  const items: DigestItem[] = [];
  const skipped: SkippedAlerts[] = [];

  for (const [productId, group] of byProduct) {
    const alertIds = group.map((a) => a._id.toString());
    const product = products.get(productId);
    const lowestAlerted = Math.min(...group.map((a) => a.newPrice));
    const oldPrice = Math.max(...group.map((a) => a.oldPrice));

    if (!product) {
      skipped.push({ alertIds, reason: "product-missing" });
    } else if (product.isActive === false || product.inStock === false) {
      skipped.push({ alertIds, reason: "unavailable" });
    } else if (product.currentPrice == null || product.currentPrice > lowestAlerted) {
      skipped.push({ alertIds, reason: "price-rose" });
    } else {
      items.push({
        productId,
        title: product.title,
        brandName: product.brandName,
        imageUrl: product.imageUrl,
        oldPrice,
        newPrice: product.currentPrice,
        percent: dropPercent(oldPrice, product.currentPrice),
        isLowest30d: product.isLowest30d,
        alertIds,
      });
    }
  }

  items.sort((a, b) => b.percent - a.percent || a.newPrice - b.newPrice);
  return { items, skipped };
}
