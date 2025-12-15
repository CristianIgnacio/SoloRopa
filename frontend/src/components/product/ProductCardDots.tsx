// src/components/product/ProductCardDots.tsx
import { useState } from "react"
import FavoriteButton from "../ui/FavoriteButton"
import type { Product } from "../../Types/Types"
import {preloadImage} from "../../utils/image"

type Props = {
  product: Product
  onClick?: () => void
}

export default function ProductCardDots({ product, onClick }: Props) {
  const [activeImage, setActiveImage] = useState(0)
  const [preloaded, setPreloaded] = useState<Set<number>>(new Set())

  const images = product.images.slice(0, 5) // limit sano

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
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-white"
      onMouseEnter={onMouseEnterCard}
    >
      {/* Imagen */}
      <div className="relative aspect-3/4 bg-slate-100">
        <img
          src={images[activeImage].src}
          alt={images[activeImage].alt}
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
          <span className="rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur">
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

      {/* Info siempre visible */}
      <div className="p-2">
        <p className="line-clamp-2 text-sm font-medium">
          {product.title}
        </p>
        <p className="mt-1 text-sm font-semibold">
          ${product.price?.toLocaleString("es-CL")}
        </p>
      </div>
    </div>
  )
}
