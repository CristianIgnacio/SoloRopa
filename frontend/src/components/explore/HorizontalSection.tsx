// src/components/explore/HorizontalSection.tsx
import type { Product } from "../../Types/Types"
import ProductCardDots from "../product/ProductCardDots"
import { useRef, type ReactNode } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"

type Props = {
  title: ReactNode
  products: Product[]
  onProductClick?: (product: Product) => void
}



export default function HorizontalSection({ title, products, onProductClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (products.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    const scrollAmount = 320 // px por click
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <button className="text-sm text-slate-500 hover:underline">
          Ver más
        </button>
      </div>

      {/* Carrusel */}
      <div className="flex items-center gap-2">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full border border-slate-200 bg-white
            text-slate-600
            transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll izquierda"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
        </button>

        {/* Contenedor scroll */}
        <div
          ref={scrollRef}
          className="
            flex flex-1 gap-4
            overflow-x-hidden scroll-smooth
          "
        >
          {products.map((product) => (
            <div key={product.id} className="w-48 shrink-0">
              <ProductCardDots
                product={product}
                onClick={() => onProductClick?.(product)}
              />
            </div>
          ))}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full border border-slate-200 bg-white
            text-slate-600
            transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll derecha"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
        </button>
      </div>
    </section>
  )
}
