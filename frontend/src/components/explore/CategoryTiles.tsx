// src/components/explore/CategoryTiles.tsx
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { CATEGORY_IMAGES } from "../../data/exploreImages"

const CATEGORIES = [
  { key: "poleras", label: "Poleras" },
  { key: "polerones", label: "Polerones" },
  { key: "pantalones", label: "Pantalones" },
  { key: "shorts", label: "Shorts" },
  { key: "accesorios", label: "Accesorios" },
]

export default function CategoryTiles() {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl font-black uppercase leading-none tracking-tighter text-black sm:text-3xl md:text-4xl">
        Arma tu outfit
      </h2>
      <div className="-mx-4 flex snap-x scroll-pl-4 gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:scroll-pl-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            to={`/search?category=${cat.key}`}
            className="group relative aspect-[3/4] w-40 shrink-0 snap-start overflow-hidden bg-slate-200 sm:w-auto"
          >
            <img
              src={CATEGORY_IMAGES[cat.key]}
              alt={cat.label}
              loading="lazy"
              className="editorial-photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-sm font-black uppercase tracking-tight text-white sm:text-base">
              {cat.label}
              <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
