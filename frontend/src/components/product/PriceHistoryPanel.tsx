// src/components/product/PriceHistoryPanel.tsx
// Historial de precio en ProductDetail: gráfico + resumen. Se carga aparte del producto.
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowTrendDown, faChartLine } from "@fortawesome/free-solid-svg-icons"
import productService from "../../services/products"
import type { PriceHistory } from "../../Types/Types"
import PriceHistoryChart from "./PriceHistoryChart"
import { formatCLP, formatShortDate } from "../../utils/priceHistory"

const DAYS = 90

type Props = {
  productId: string
  /** Precio que se muestra ahora (puede ser el de la variante elegida). */
  displayedPrice?: number | null
}

export default function PriceHistoryPanel({ productId, displayedPrice }: Props) {
  // Guardar a qué producto pertenece la respuesta: al navegar a otro producto, la anterior
  // deja de valer sola y se muestra el esqueleto hasta que llegue la nueva.
  const [result, setResult] = useState<{ productId: string; history: PriceHistory | null } | null>(null)

  useEffect(() => {
    let cancelled = false
    productService
      .getPriceHistory(productId, DAYS)
      .then((history) => { if (!cancelled) setResult({ productId, history }) })
      // Si falla, no se muestra el panel; no bloquea la página.
      .catch(() => { if (!cancelled) setResult({ productId, history: null }) })
    return () => { cancelled = true }
  }, [productId])

  if (result?.productId !== productId) {
    return <div className="skeleton-shimmer mb-8 h-[13.5rem] border-2 border-slate-200" aria-hidden />
  }

  const history = result.history
  const stats = history?.stats
  const points = history?.points ?? []
  if (!stats || points.length === 0) return null

  const isLowest = stats.isLowest30d
  const prices = points.map((p) => p.price)
  const followsOtherPrice = displayedPrice != null && displayedPrice !== stats.current

  return (
    <section
      aria-label="Historial de precio"
      className={`mb-8 border-2 border-black p-4 shadow-[4px_4px_0_0_#000] ${isLowest ? "bg-green-400" : "bg-white"}`}
    >
      <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-black">
        <FontAwesomeIcon icon={isLowest ? faArrowTrendDown : faChartLine} />
        {isLowest ? "Precio más bajo en 30 días" : "Historial de precio"}
      </h4>

      <p className="mt-2 text-sm font-bold text-slate-900 text-balance">
        {isLowest
          ? `Hoy está en ${formatCLP(stats.current)}, lo más bajo del último mes (llegó a ${formatCLP(stats.max30d)}).`
          : points.length > 1
            ? `Entre ${formatCLP(Math.min(...prices))} y ${formatCLP(Math.max(...prices))} en los últimos ${DAYS} días.`
            : `Sin cambios de precio desde el ${formatShortDate(stats.trackedSince)}.`}
      </p>

      {points.length > 1 && (
        <div className="mt-4 border-2 border-black bg-white px-3 pb-2 pt-4">
          <PriceHistoryChart points={points} />
        </div>
      )}

      {followsOtherPrice && (
        <p className="mt-3 text-xs font-semibold text-slate-700">
          El historial sigue el precio más bajo entre las variantes ({formatCLP(stats.current)}).
        </p>
      )}
    </section>
  )
}
