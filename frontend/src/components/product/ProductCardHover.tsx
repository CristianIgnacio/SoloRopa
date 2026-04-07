// src/components/product/ProductCardHover.tsx
import FavoriteButton from "../ui/FavoriteButton"
import type { Product } from "../../Types/Types"
import { useProductEvents } from "../../Hooks/useProductEvents"

type Props = {
  product: Product
  onClick?: () => void
}

export default function ProductCardHover({ product, onClick }: Props) {
    const { trackClick } = useProductEvents(product.id)

    const handleInternalClick = () => {
        trackClick()
        onClick?.()
    }

    return (
        <div
            onClick={handleInternalClick}
            className="group relative cursor-pointer overflow-hidden rounded-sm border-2 border-black bg-white shadow-none transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
        >
      {/* Imagen */}
      <img
        src={product.images[0].src}
        alt={product.images[0].alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlay */}
      <div
        className="
          absolute inset-0
          flex flex-col justify-between
          bg-black/50
          p-3
          opacity-0
          transition-opacity duration-200
          group-hover:opacity-100
        "
      >
        {/* Top */}
        <div className="flex justify-end">
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
