// src/components/explore/EditorialProductCard.tsx
// Card de producto limpia (sin bordes ni sombras) para las secciones editoriales de Explore.
import type { Product } from "../../Types/Types"
import ProductImage from "../ui/ProductImage"
import FavoriteButton from "../ui/FavoriteButton"
import { useProductEvents } from "../../Hooks/useProductEvents"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import { getDiscount } from "../../utils/discount"

type Props = {
  product: Product
  onClick?: () => void
}

export default function EditorialProductCard({ product, onClick }: Props) {
  const { trackClick } = useProductEvents(product.id)
  const isFavorite = useWishlistStore((s) => s.favoriteIds.has(product.id))
  const [first, second] = product.images
  const discount = getDiscount(product)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        trackClick()
        onClick?.()
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          trackClick()
          onClick?.()
        }
      }}
      className="group flex cursor-pointer flex-col text-left"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <ProductImage
          src={first?.src}
          alt={first?.alt || product.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-all duration-500 ${second ? "group-hover:opacity-0" : "group-hover:scale-105"}`}
        />
        {second && (
          <ProductImage
            src={second.src}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {discount && (
          <span className="absolute left-2 top-2 bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black text-black sm:text-xs">
            -{discount.percent}%
          </span>
        )}

        {/* Móvil: siempre visible. Escritorio: aparece con hover/foco, salvo que ya sea favorito */}
        <div
          className={`absolute right-2 top-2 transition-opacity duration-200 ${
            isFavorite ? "" : "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          }`}
        >
          <FavoriteButton productId={product.id} />
        </div>
      </div>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {product.brand?.name}
      </p>
      <p className="line-clamp-1 text-xs font-bold uppercase tracking-tight text-black sm:text-sm">
        {product.title}
      </p>
      <p className="flex items-baseline gap-2 text-sm font-extrabold text-slate-900">
        ${product.price?.toLocaleString("es-CL")}
        {discount && (
          <span className="text-xs font-semibold text-slate-400 line-through">
            ${discount.originalPrice.toLocaleString("es-CL")}
          </span>
        )}
      </p>
    </div>
  )
}
