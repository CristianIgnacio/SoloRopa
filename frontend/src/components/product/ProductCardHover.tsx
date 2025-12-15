// src/components/product/ProductCardHover.tsx
import FavoriteButton from "../ui/FavoriteButton"
import type { Product } from "../../Types/Types"

type Props = {
  product: Product
  onClick?: () => void
}

export default function ProductCardHover({ product, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-slate-100"
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
          <p className="text-xs opacity-80">{product.brand.name}</p>
          <p className="text-sm font-medium leading-tight">
            {product.title}
          </p>
          <p className="mt-1 text-sm font-semibold">
            ${product.price?.toLocaleString("es-CL")}
          </p>
        </div>
      </div>
    </div>
  )
}
