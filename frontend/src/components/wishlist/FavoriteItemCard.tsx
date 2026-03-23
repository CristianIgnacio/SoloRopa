// src/components/wishlist/FavoriteItemCard.tsx
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

    const handleRemove = async () => {
        await wishlistServices.deleteItemToWishlist(wishlistId, item.id)
        onRemoved(item.id)
        loadFavorites()
    }

  return (
    <div className="relative rounded-lg border bg-white p-3">
      <img
        src={item.images[0].src}
        alt={item.images[0].alt}
        className="mb-2 h-120 w-full rounded object-cover"
      />

      <p className="text-xs text-slate-500">{item.brand.name}</p>
      <p className="text-sm font-medium">{item.title}</p>
      <p className="text-sm font-semibold">
        ${item.price?.toLocaleString("es-CL")}
      </p>

      <button
        onClick={handleRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-sm text-red-500 shadow hover:bg-red-50"
        title="Quitar de la colección"
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    </div>
  )
}
