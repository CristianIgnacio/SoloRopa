// src/components/explore/StyleShowcase.tsx
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { STYLE_IMAGES } from "../../data/exploreImages"

const STYLES = [
  { key: "urbano", label: "Urbano" },
  { key: "streetwear", label: "Streetwear" },
  { key: "skate", label: "Skate" },
]

export default function StyleShowcase() {
  return (
    <section className="mt-16 grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-black md:text-5xl">
          Descubre
          <br />
          tu estilo
        </h2>
        <p className="max-w-xs text-sm font-medium leading-relaxed text-slate-700">
          Selecciones curadas por estética, mood y ocasión. Encuentra prendas de distintas marcas en un solo lugar.
        </p>
        <Link
          to="/search"
          className="group inline-flex items-center gap-2 border-2 border-black bg-black px-5 py-2 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-400 hover:text-black"
        >
          Ver estilos
          <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {STYLES.map((style) => (
          <Link
            key={style.key}
            to={`/search?style=${style.key}`}
            className="group relative aspect-[3/4] overflow-hidden bg-slate-200"
          >
            <img
              src={STYLE_IMAGES[style.key]}
              alt={style.label}
              loading="lazy"
              className="editorial-photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs font-black uppercase tracking-tight text-white sm:bottom-3 sm:left-3 sm:right-3 sm:text-base">
              {style.label}
              <FontAwesomeIcon icon={faArrowRight} className="hidden text-xs transition-transform group-hover:translate-x-1 sm:inline-block" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
