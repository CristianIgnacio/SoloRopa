// src/components/explore/BrandGrid.tsx
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import type { Brand } from "../../Types/Types"
import BrandLogo from "../ui/BrandLogo"
import { BRANDS_BANNER_IMAGE } from "../../data/exploreImages"

type Props = {
  brands: Brand[]
}

const MAX_VISIBLE = 7

export default function BrandGrid({ brands }: Props) {
  if (brands.length === 0) return null

  const visible = brands.slice(0, MAX_VISIBLE)
  const remaining = brands.length - visible.length

  return (
    <section className="relative mt-16 overflow-hidden bg-black">
      <img
        src={BRANDS_BANNER_IMAGE}
        alt="Grupo de personas con ropa urbana sentadas sobre un auto"
        loading="lazy"
        className="editorial-photo absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

      <div className="relative grid gap-6 p-5 md:grid-cols-[1fr_1fr] md:items-center md:p-8">
        {/* Texto */}
        <div className="flex flex-col items-start gap-3">
          <span className="bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
            Hecho en Chile
          </span>
          <h2 className="text-3xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-5xl">
            Marcas chilenas
            <br />
            en SoloRopa
          </h2>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-white/80">
            {brands.length} marcas locales que están construyendo la escena streetwear en Chile, reunidas en un solo lugar.
          </p>
          <Link
            to="/search"
            className="group inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-yellow-400 sm:text-sm"
          >
            Ver todas las marcas
            <FontAwesomeIcon icon={faArrowRight} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Logos */}
        <div className="grid w-full grid-cols-4 gap-2 md:max-w-md md:justify-self-end">
          {visible.map((brand) => (
            <Link
              key={brand.id}
              to={`/search?brand=${brand.id}`}
              title={`Ver productos de ${brand.name}`}
              style={{ backgroundColor: brand.logo?.backgroundColor || "#ffffff" }}
              className="group relative flex aspect-square items-center justify-center overflow-hidden outline-offset-0 transition-[outline] hover:outline-4 hover:outline-yellow-400"
            >
              <BrandLogo brand={brand} className="h-3/5 w-3/4 object-contain transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-yellow-400 py-1 text-center text-[9px] font-bold uppercase tracking-widest text-black transition-transform group-hover:translate-y-0 sm:text-[10px]">
                {brand.name}
              </span>
            </Link>
          ))}

          {remaining > 0 && (
            <Link
              to="/search"
              className="group flex aspect-square flex-col items-center justify-center gap-0.5 border-2 border-white/80 text-white transition-colors hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <span className="text-xl font-black sm:text-2xl">+{remaining}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest">marcas</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
