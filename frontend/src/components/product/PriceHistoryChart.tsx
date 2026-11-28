// src/components/product/PriceHistoryChart.tsx
// Gráfico escalonado del precio (cambia a saltos, no en línea recta). SVG propio, sin librería.
// La línea vive en un SVG estirado al contenedor; puntos, textos y tooltip son HTML para no deformarse.
import { useMemo, useRef, useState } from "react"
import type { PointerEvent } from "react"
import type { PricePoint } from "../../Types/Types"
import { formatCLP, formatShortDate } from "../../utils/priceHistory"

type Props = {
  points: PricePoint[] // al menos 2, del más antiguo al más reciente
  /** Fin del eje X. Por defecto, ahora. */
  now?: Date
}

const W = 1000
const H = 200

export default function PriceHistoryChart({ points, now }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [nowMs] = useState(() => (now ?? new Date()).getTime())
  const [hover, setHover] = useState<{ ratio: number; index: number } | null>(null)

  const chart = useMemo(() => {
    const series = points.map((p) => ({ price: p.price, t: new Date(p.recordedAt).getTime() }))
    const t0 = series[0].t
    const t1 = Math.max(nowMs, series[series.length - 1].t)
    const prices = series.map((s) => s.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const pad = (max - min) * 0.25 || max * 0.05
    const lo = min - pad
    const hi = max + pad

    const x = (t: number) => ((t - t0) / (t1 - t0 || 1)) * W
    const y = (price: number) => H - ((price - lo) / (hi - lo)) * H

    let line = `M 0 ${y(series[0].price)}`
    for (let i = 1; i < series.length; i++) {
      line += ` H ${x(series[i].t)} V ${y(series[i].price)}`
    }
    line += ` H ${W}`

    // Marca el mínimo más reciente (si el precio actual es el mínimo, cae sobre el punto final).
    const minIndex = prices.lastIndexOf(min)

    return { series, t0, t1, min, max, x, y, line, area: `${line} V ${H} H 0 Z`, minIndex }
  }, [points, nowMs])

  const { series, t0, t1, min, max, x, y, line, area, minIndex } = chart
  const last = series[series.length - 1]
  const pct = (value: number, total: number) => `${(value / total) * 100}%`

  const handlePointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const t = t0 + ratio * (t1 - t0)
    let index = 0
    for (let i = 0; i < series.length; i++) if (series[i].t <= t) index = i
    setHover({ ratio, index })
  }

  const hovered = hover ? series[hover.index] : null
  const segmentEnd = hover && hover.index < series.length - 1 ? formatShortDate(series[hover.index + 1].t) : "hoy"

  return (
    <div>
      <div
        ref={ref}
        role="img"
        aria-label={`Historial de precio desde el ${formatShortDate(t0)}: entre ${formatCLP(min)} y ${formatCLP(max)}. Hoy ${formatCLP(last.price)}.`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setHover(null)}
        className="relative h-32 w-full touch-pan-y select-none"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <path d={area} className="fill-slate-100" />
          <path d={line} fill="none" stroke="black" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {hover && (
            <line
              x1={hover.ratio * W} x2={hover.ratio * W} y1={0} y2={H}
              stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {/* Mínimo */}
        {minIndex !== series.length - 1 && (
          <span
            aria-hidden
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-green-400"
            style={{ left: pct(x(series[minIndex].t), W), top: pct(y(min), H) }}
          />
        )}
        {/* Precio actual */}
        <span
          aria-hidden
          className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 border-2 border-black ${last.price === min ? "bg-green-400" : "bg-black"}`}
          style={{ left: "100%", top: pct(y(last.price), H) }}
        />

        {hover && hovered && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 whitespace-nowrap border-2 border-black bg-white px-2 py-1 shadow-[3px_3px_0_0_#000]"
            style={{
              left: pct(hover.ratio * W, W),
              top: pct(y(hovered.price), H),
              transform: `translate(${hover.ratio > 0.65 ? "calc(-100% - 8px)" : "8px"}, -50%)`,
            }}
          >
            <p className="text-sm font-black text-black">{formatCLP(hovered.price)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {formatShortDate(hovered.t)} – {segmentEnd}
            </p>
          </div>
        )}
      </div>

      <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>{formatShortDate(t0)}</span>
        <span>Hoy</span>
      </div>
    </div>
  )
}
