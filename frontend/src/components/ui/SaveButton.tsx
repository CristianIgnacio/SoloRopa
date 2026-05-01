import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faBookmark } from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import SaveToWishlistModal from "../wishlist/SaveToWishlistModal"

type Props = {
  productId: string
  /** "card" = 3 puntos blancos sin fondo (para overlay de cards)
   *  "detail" = ícono de marcador con fondo (para ProductDetail/QuickView) */
  variant?: "card" | "detail"
}

const SYSTEM_NAMES = ["Favoritos", "Vistos Recientemente"]

export default function SaveButton({ productId, variant = "detail" }: Props) {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const { wishlist } = useWishlistStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isSavedInUserList = wishlist
    .filter((w) => !w.isSystem && !w.isDefault && !SYSTEM_NAMES.includes(w.name))
    .some((w) =>
      w.items.some((item: any) => {
        const prod = item.productId
        return (prod?.id || prod?._id || prod) === productId
      })
    )

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!user) return navigate("/login")
    setIsModalOpen(true)
  }

  return (
    <>
      {variant === "card" ? (
        <button
          onClick={handleClick}
          className="flex h-8 w-8 items-center justify-center transition hover:opacity-70"
          aria-label="Guardar en colección"
          title="Guardar en colección"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4 text-white" />
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur transition hover:scale-110"
          aria-label="Guardar en colección"
          title="Guardar en colección"
        >
          {isSavedInUserList ? (
            <FontAwesomeIcon icon={faBookmark} className="h-4 w-4 text-yellow-500" />
          ) : (
            <FontAwesomeIcon icon={faBookmarkRegular} className="h-4 w-4 text-slate-700" />
          )}
        </button>
      )}

      {user && (
        <SaveToWishlistModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
        />
      )}
    </>
  )
}
