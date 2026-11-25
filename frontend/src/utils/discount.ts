// src/utils/discount.ts
import type { Product } from "../Types/Types"

/** Devuelve el mayor descuento entre las variantes (comparePrice > price), o null si no hay oferta. */
export function getDiscount(product: Product): { percent: number; originalPrice: number } | null {
  let best: { percent: number; originalPrice: number } | null = null

  for (const v of product.variants ?? []) {
    const price = v.price ?? product.price ?? 0
    const compare = v.comparePrice ?? 0
    if (price > 0 && compare > price) {
      const percent = Math.round((1 - price / compare) * 100)
      if (percent > 0 && (!best || percent > best.percent)) {
        best = { percent, originalPrice: compare }
      }
    }
  }

  return best
}
