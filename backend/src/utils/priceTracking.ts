// Funciones puras para el historial de precios. Sin acceso a BD para poder probarlas solas.

type PricedVariant = { price?: number | null; comparePrice?: number | null };

export type TrackedPrice = { price: number; comparePrice: number | null };

const isValidPrice = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/**
 * Precio "desde" de un producto: el más bajo entre sus variantes con precio.
 * Si ninguna variante tiene precio, usa product.price. Devuelve null si no hay precio válido.
 * comparePrice solo se conserva si es mayor que el precio (si no, no es una oferta).
 */
export function getTrackedPrice(
  variants: PricedVariant[] | null | undefined,
  fallbackPrice: number | null | undefined
): TrackedPrice | null {
  let best: TrackedPrice | null = null;

  for (const variant of variants ?? []) {
    if (!isValidPrice(variant.price)) continue;
    const comparePrice =
      isValidPrice(variant.comparePrice) && variant.comparePrice > variant.price
        ? variant.comparePrice
        : null;

    const isCheaper = !best || variant.price < best.price;
    // Con precios iguales, quedarse con el comparePrice más alto para no depender del orden de las variantes.
    const isTieWithHigherCompare =
      best !== null && variant.price === best.price && (comparePrice ?? 0) > (best.comparePrice ?? 0);

    if (isCheaper || isTieWithHigherCompare) {
      best = { price: variant.price, comparePrice };
    }
  }

  if (best) return best;
  return isValidPrice(fallbackPrice) ? { price: fallbackPrice, comparePrice: null } : null;
}

/**
 * Indica si hay que guardar una fila nueva en el historial.
 * Solo cuenta el precio: un cambio de comparePrice por sí solo no mueve el gráfico.
 * Si la extracción nueva no trae precio, no se registra nada (no es una bajada a $0).
 */
export function hasPriceChanged(previous: TrackedPrice | null, next: TrackedPrice | null): boolean {
  if (!next) return false;
  if (!previous) return true;
  return previous.price !== next.price;
}

// --- Estadísticas sobre el historial ---

const DAY_MS = 24 * 60 * 60 * 1000;

export const PRICE_STATS_WINDOW_DAYS = 30;

export type PricePoint = { price: number; recordedAt: Date };

export type PriceStats = {
  current: number;
  min30d: number;
  max30d: number;
  isLowest30d: boolean;
  trackedSince: Date;   // primera fila del historial
  lastChangeAt: Date;   // última fila del historial
};

const sortByDate = (rows: PricePoint[]) =>
  [...rows].sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

/**
 * Puntos de los últimos `days` días. Como solo guardamos cambios, el precio vigente al inicio
 * de la ventana es la última fila anterior a ella: se incluye, movida al inicio de la ventana.
 */
export function getPriceWindow(rows: PricePoint[], now: Date, days: number): PricePoint[] {
  const start = new Date(now.getTime() - days * DAY_MS);
  let before: PricePoint | null = null;
  const inside: PricePoint[] = [];

  for (const row of sortByDate(rows)) {
    if (row.recordedAt > now) continue;
    if (row.recordedAt <= start) before = row;
    else inside.push(row);
  }

  return before ? [{ price: before.price, recordedAt: start }, ...inside] : inside;
}

/**
 * Resumen de los últimos 30 días. `isLowest30d` solo es true si llevamos 30 días o más
 * siguiendo el producto, el precio actual es el mínimo de la ventana y hubo uno más alto
 * en ella (si no, todo producto con precio estable saldría como "el más bajo").
 */
export function computePriceStats(rows: PricePoint[], now: Date): PriceStats | null {
  const history = sortByDate(rows).filter((row) => row.recordedAt <= now);
  if (!history.length) return null;

  const windowStart = new Date(now.getTime() - PRICE_STATS_WINDOW_DAYS * DAY_MS);
  const prices = getPriceWindow(history, now, PRICE_STATS_WINDOW_DAYS).map((p) => p.price);
  const first = history[0];
  const last = history[history.length - 1];

  const current = last.price;
  const min30d = Math.min(...prices);
  const max30d = Math.max(...prices);
  const trackedLongEnough = first.recordedAt <= windowStart;

  return {
    current,
    min30d,
    max30d,
    isLowest30d: trackedLongEnough && current <= min30d && max30d > current,
    trackedSince: first.recordedAt,
    lastChangeAt: last.recordedAt,
  };
}

/** Normaliza el parámetro ?days del endpoint: entero entre 1 y 365, 90 por defecto. */
export function parseHistoryDays(value: unknown): number {
  const days = Math.round(Number(value));
  if (!Number.isFinite(days) || days < 1) return 90;
  return Math.min(days, 365);
}
