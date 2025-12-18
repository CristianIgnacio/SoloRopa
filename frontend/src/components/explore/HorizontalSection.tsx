// src/components/explore/HorizontalSection.tsx
import type { Product } from "../../Types/Types"
import ProductCardDots from "../product/ProductCardDots"
import { useRef } from "react"

type Props = {
  title: string
  products: Product[]
  onProductClick?: (product: Product) => void
}

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
)

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
      <div className="flex items-stretch gap-2">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="
            flex w-10 items-center justify-center
            rounded-md border-slate-600 bg-white
            text-slate-600
            transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll izquierda"
        >
          <ChevronLeft/>
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
            flex w-10 items-center justify-center
            rounded-md border-slate-600 bg-white
            text-slate-600
            transition
            hover:bg-slate-100 hover:text-slate-900
          "
          aria-label="Scroll derecha"
        >
          <ChevronRight/>
        </button>
      </div>
    </section>
  )
}
