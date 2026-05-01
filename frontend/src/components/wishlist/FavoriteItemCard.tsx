// src/components/wishlist/FavoriteItemCard.tsx
import { Link } from "react-router-dom"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import wishlistServices from "../../services/wishlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrashCan } from "@fortawesome/free-solid-svg-icons"
import type { Product } from "../../Types/Types"

type Props = {
  item: Product
  wishlistId: string
  onRemoved: (productId: string) => void
}

export default function FavoriteItemCard({ item, wishlistId, onRemoved }: Props) {
    const {loadFavorites} = useWishlistStore()

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        await wishlistServices.deleteItemToWishlist(wishlistId, item.id)
        onRemoved(item.id)
        loadFavorites()
    }

  return (
    <Link
      to={`/producto/${item.id}`}
      className="group relative cursor-pointer overflow-hidden rounded-none border-2 border-black bg-white shadow-none transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]"
    >
      <img
        src={item.images?.[0]?.src || "/img/no-image.png"}
        alt={item.images?.[0]?.alt || item.title}
        className="aspect-3/4 w-full border-b-2 border-black object-cover"
      />

      <div className="p-2">
        <p className="inline-block border border-black bg-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-[1px_1px_0_0_#000]">
          {item.brand.name}
        </p>
        <p className="mt-1 truncate text-xs font-black uppercase tracking-tighter text-black">
          {item.title}
        </p>
        <p className="mt-0.5 text-sm font-black text-black">
          ${item.price?.toLocaleString("es-CL")}
        </p>
      </div>

      <button
        onClick={handleRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center border-2 border-black bg-red-500 text-white shadow-[2px_2px_0_0_#000] transition-colors hover:bg-black hover:text-red-500 active:translate-y-px active:shadow-none"
        title="Quitar de la colección"
      >
        <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
      </button>
    </Link>
  )
}
