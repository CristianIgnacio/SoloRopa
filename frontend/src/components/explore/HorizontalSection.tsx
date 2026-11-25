// src/components/explore/HorizontalSection.tsx
import { useRef, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import type { Product } from "../../Types/Types"
import EditorialProductCard from "./EditorialProductCard"

type Props = {
  title: ReactNode
  products: Product[]
  onProductClick?: (product: Product) => void
  viewMoreLink?: string
}

const arrowClass =
  "hidden h-9 w-9 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-black hover:text-white md:flex"

export default function HorizontalSection({ title, products, onProductClick, viewMoreLink }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: (direction === "left" ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <section className="mt-16">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-black sm:text-3xl md:text-4xl">{title}</h2>
        <div className="flex items-center gap-3">
          {viewMoreLink && (
            <Link
              to={viewMoreLink}
              className="text-xs font-bold uppercase tracking-widest text-black underline decoration-2 underline-offset-4 transition-colors hover:bg-yellow-400 sm:text-sm"
            >
              Ver todo
            </Link>
          )}
          <button onClick={() => scroll("left")} className={arrowClass} aria-label="Anterior">
            <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
          </button>
          <button onClick={() => scroll("right")} className={arrowClass} aria-label="Siguiente">
            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Carrusel: deslizable con el dedo en móvil, flechas en escritorio */}
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:gap-4 md:px-0 md:scroll-pl-0 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-4rem)/5)]">
            <EditorialProductCard product={product} onClick={() => onProductClick?.(product)} />
          </div>
        ))}
      </div>
    </section>
  )
}
