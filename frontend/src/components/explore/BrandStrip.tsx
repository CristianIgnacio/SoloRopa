// src/components/explore/BrandCarousel.tsx
import { useRef } from "react"
import type { Brand } from "../../Types/Types"

type Props = {
  brands: Brand[]
  onSelect?: (brandId: string) => void
}

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

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

      <div className="flex items-stretch gap-3">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            flex w-10 items-center justify-center
            rounded-md bg-white
            text-slate-500 transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll marcas izquierda"
        >
          <ChevronLeft />
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
                  flex h-25 w-25 items-center justify-center
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
            flex w-10 items-center justify-center
            rounded-md bg-white
            text-slate-500 transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll marcas derecha"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  )
}