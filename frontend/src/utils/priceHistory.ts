// src/utils/priceHistory.ts
import type { PriceStats } from "../Types/Types"

export const formatCLP = (value: number) => `$${value.toLocaleString("es-CL")}`

export const formatShortDate = (date: string | number | Date) =>
  new Date(date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })

/**
 * La etiqueta "precio más bajo en 30 días" solo se muestra junto al precio que seguimos
 * (el más bajo entre variantes). Así no aparece al lado de una talla más cara.
 */
export function showsLowest30d(stats: PriceStats | null | undefined, displayedPrice: number | null | undefined) {
  return !!stats?.isLowest30d && displayedPrice === stats.current
}
