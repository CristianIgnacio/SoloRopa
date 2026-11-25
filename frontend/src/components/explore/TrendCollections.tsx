// src/components/explore/TrendCollections.tsx
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { TREND_IMAGES } from "../../data/exploreImages"

const TRENDS = [
  { key: "y2k", label: "Y2K" },
  { key: "workwear", label: "Workwear" },
  { key: "vintage", label: "Vintage" },
  { key: "dark", label: "Dark" },
  { key: "minimal", label: "Minimal" },
]

export default function TrendCollections() {
  return (
    <section className="mt-16 grid gap-8 bg-[#F0F0F0] md:grid-cols-2 md:items-center">
      <div className="grid h-72 grid-cols-2 gap-1 sm:h-96 md:h-[440px]">
        {TREND_IMAGES.map((src) => (
          <div key={src} className="overflow-hidden bg-slate-200">
            <img src={src} alt="" loading="lazy" className="editorial-photo h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-center gap-4 px-6 pb-8 md:px-10 md:pb-0">
        <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-black md:text-5xl">
          Colecciones
          <br />
          por tendencia
        </h2>
        <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-700">
          Selecciones que reúnen lo mejor del streetwear actual: siluetas, colores y prendas que están marcando la calle.
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDS.map((trend) => (
            <Link
              key={trend.key}
              to={`/search?style=${trend.key}`}
              className="group inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-yellow-400"
            >
              {trend.label}
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px] transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
