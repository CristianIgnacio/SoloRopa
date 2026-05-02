// src/components/product/ProductCardHover.tsx
import { useState } from "react"
import FavoriteButton from "../ui/FavoriteButton"
import SaveButton from "../ui/SaveButton"
import type { Product } from "../../Types/Types"
import { useProductEvents } from "../../Hooks/useProductEvents"

type Props = {
  product: Product
  onClick?: () => void
  /** "natural" → la card crece según el alto real de la imagen (masonry libre)
   *  "fixed"   → aspect-ratio 4/5 fijo (grid uniforme, default) */
  imageMode?: "natural" | "fixed"
}

export default function ProductCardHover({ product, onClick, imageMode = "fixed" }: Props) {
    const { trackClick } = useProductEvents(product.id)
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleInternalClick = () => {
        trackClick()
        onClick?.()
    }

    const isNatural = imageMode === "natural"

    return (
        <div
            onClick={handleInternalClick}
            className="group relative cursor-pointer overflow-hidden rounded-sm border-2 border-black bg-white shadow-none transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
        >
      {/* ── Contenedor de imagen ──────────────────────────────────────────── */}
      {isNatural ? (
        /* Modo natural: sin aspect-ratio → la imagen dicta el alto */
        <div className="relative w-full overflow-hidden">
          {!imageLoaded && (
            /* Placeholder mientras carga: ocupa un espacio razonable */
            <div className="skeleton-shimmer w-full" style={{ paddingBottom: "125%" }} />
          )}
          <img
            src={product.images[0]?.src || "/img/no-image.png"}
            alt={product.images[0]?.alt || ""}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-auto block object-cover transition-all duration-300 group-hover:scale-105 img-fade-in ${imageLoaded ? "loaded" : "absolute inset-0 h-full"}`}
            loading="lazy"
          />
        </div>
      ) : (
        /* Modo fijo: aspect-ratio 4/5 */
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {!imageLoaded && (
            <div className="skeleton-shimmer absolute inset-0 z-10" />
          )}
          <img
            src={product.images[0]?.src || "/img/no-image.png"}
            alt={product.images[0]?.alt || ""}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 img-fade-in ${imageLoaded ? "loaded" : ""}`}
            loading="lazy"
          />
        </div>
      )}

      {/* Overlay — solo aparece al hacer hover */}
      <div
        className="
          absolute inset-0
          hidden lg:flex flex-col justify-between
          bg-black/50
          p-3
          opacity-0
          transition-opacity duration-200
          group-hover:opacity-100
        "
      >
        {/* Top: marcador izquierda, corazón derecha */}
        <div className="flex justify-between">
          <SaveButton productId={product.id} variant="card" />
          <FavoriteButton productId={product.id} />
        </div>

        {/* Bottom info */}
        <div className="text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">{product.brand.name}</p>
          <p className="text-sm font-bold leading-tight">
            {product.title}
          </p>
          <p className="mt-1 text-sm font-extrabold">
            ${product.price?.toLocaleString("es-CL")}
          </p>
        </div>
      </div>
    </div>
  )
}
