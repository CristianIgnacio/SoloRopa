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
