// src/components/product/ProductCardDots.tsx
import { useState } from "react"
import FavoriteButton from "../ui/FavoriteButton"
import type { Product } from "../../Types/Types"
import { preloadImage } from "../../utils/image"
import { useProductEvents } from "../../Hooks/useProductEvents"

type Props = {
  product: Product
  onClick?: () => void
}

export default function ProductCardDots({ product, onClick }: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const [preloaded, setPreloaded] = useState<Set<number>>(new Set())
  const { trackClick } = useProductEvents(product.id)

  const images = product.images.slice(0, 5) // limit sano

  const handleInternalClick = () => {
    trackClick()
    onClick?.()
  }

  const onMouseEnter = (index : number) => {
    // preload solo una vez
    if (!preloaded.has(index)) {
      preloadImage(images[index].src)
      setPreloaded((prev) => new Set(prev).add(index))
    }

    setActiveImage(index)
  }

  const onMouseEnterCard = () => {
    // preload anticipado de la segunda imagen
    if (!preloaded.has(1) && images[1]?.src) {
      preloadImage(images[1].src)
      setPreloaded((prev) => new Set(prev).add(1))
    }
  }


  return (
    <div
      onClick={handleInternalClick}
      className="group relative cursor-pointer overflow-hidden rounded-sm border-2 border-black bg-white shadow-none transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000]"
      onMouseEnter={onMouseEnterCard}
    >
      {/* Imagen */}
      <div className="relative aspect-3/4 bg-slate-100">
        <img
          src={images[activeImage]?.src || "/img/no-image.png"}
          alt={images[activeImage]?.alt || ""}
          className="h-full w-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Overlay hover */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            flex items-start justify-between
            p-2
            opacity-100
            sm:opacity-0 sm:group-hover:opacity-100
            transition-opacity
          "
        >
          {/* Marca */}
          <span className="border border-black bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_0_#000]">
            {product.brand.name}
          </span>

          {/* Favorito */}
          <div className="pointer-events-auto">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div
            className="
              pointer-events-none
              absolute bottom-3 left-1/2 -translate-x-1/2 z-10
              opacity-100 sm:opacity-0 sm:group-hover:opacity-100
              transition-opacity
            "
          >
            <div className="pointer-events-auto rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveImage(index)
                    }}
                    
                    onMouseEnter={() => onMouseEnter(index)}
                    className={`
                      rounded-full transition-all duration-200
                      ${
                        activeImage === index
                          ? "h-3 w-3 bg-white"
                          : "h-2.5 w-2.5 bg-white/60 hover:bg-white"
                      }
                    `}
                    aria-label={`Imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info siempre visible — altura fija para cards uniformes en el carrusel */}
      <div className="flex h-[84px] flex-col justify-between border-t-2 border-black bg-white p-2 pb-3">
        <p className="line-clamp-2 text-xs font-bold leading-tight sm:text-sm">
          {product.title}
        </p>
        <p className="text-sm font-extrabold text-slate-900">
          ${product.price?.toLocaleString("es-CL")}
        </p>
      </div>
    </div>
  )
}
