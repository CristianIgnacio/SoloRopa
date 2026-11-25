// src/components/explore/LookBanners.tsx
// Banners "Look Hombre / Look Mujer": dos fotos grandes lado a lado, cada una con su botón.
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { LOOK_IMAGES } from "../../data/exploreImages"

const LOOKS = [
  { gender: "hombre", title: "Look Hombre", subtitle: "Siluetas anchas, básicos y denim para la calle." },
  { gender: "mujer", title: "Look Mujer", subtitle: "Capas, oversize y color para un fit con actitud." },
] as const

export default function LookBanners() {
  return (
    <section className="mt-16 grid gap-3 md:grid-cols-2">
      {LOOKS.map((look) => (
        <Link
          key={look.gender}
          to={`/search?gender=${look.gender}`}
          className="group relative block aspect-[5/4] overflow-hidden bg-black md:aspect-[4/5]"
        >
          <img
            src={LOOK_IMAGES[look.gender]}
            alt={look.title}
            loading="lazy"
            className="editorial-photo absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 md:p-8">
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-6xl">
              {look.title}
            </h2>
            <p className="max-w-xs text-sm font-medium text-white/80">{look.subtitle}</p>
            <span className="mt-1 inline-flex w-fit items-center gap-2 bg-white px-5 py-2 text-sm font-bold uppercase tracking-wider text-black transition-colors group-hover:bg-yellow-400">
              Ver todo {look.gender}
              <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  )
}
