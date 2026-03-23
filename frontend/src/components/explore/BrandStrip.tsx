import { useRef } from "react"
import type { Brand } from "../../Types/Types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"

type Props = {
  brands: Brand[]
  onSelect?: (brandId: string) => void
}

export default function BrandCarousel({ brands, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (brands.length === 0) return null

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    })
  }

  return (
    <section className="mt-4">
      <h2 className="mb-4 text-lg font-medium">Explorar por marca</h2>

      <div className="flex items-center gap-3">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full bg-white
            text-slate-500 transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll marcas izquierda"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Carrusel */}
        <div
          ref={scrollRef}
          className="
            flex flex-1 gap-6
            overflow-x-hidden
            py-6
            px-3

          "
        >
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelect?.(brand.id)}
              className="flex shrink-0 flex-col items-center text-center"
            >
              <div
                style={{ backgroundColor: brand.logo?.backgroundColor || "#ffffff" }}
                className="
                  flex h-24 w-24 items-center justify-center
                  rounded-full border-2 border-slate-200
                  transition-all duration-200
                  hover:scale-110 hover:border-slate-900 hover:shadow-lg
                "
              >
                <img
                  src={brand.logo?.src}
                  alt={brand.name}
                  className="h-4/5 w-4/5 object-contain"
                  loading="lazy"
                />
              </div>

              <span className="mt-2 whitespace-nowrap text-sm text-slate-700">
                {brand.name}
              </span>
            </button>
          ))}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full bg-white
            text-slate-500 transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll marcas derecha"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </section>
  )
}