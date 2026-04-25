import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import { useProductEvents } from "../../Hooks/useProductEvents"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons"

type Props = {
  productId: string
}

export default function FavoriteButton({ productId }: Props) {
  const toggleFavorite = useWishlistStore((s) => s.toggleFavorite)
  const isFavorite = useWishlistStore((s) => s.favoriteIds.has(productId))
  const {user} = useUserStore()
  const navigate = useNavigate()

  const { trackFavorite, trackUnfavorite } = useProductEvents(productId)

  const onClickButton = (e : any) => {
    e.stopPropagation()
    if(!user){
      return navigate("/login")
    }
    
    // Si ya era favorito, ahora vamos a quitarlo (unfavorite)
    // Si no era favorito, ahora lo agregamos (favorite)
    if (isFavorite) {
      trackUnfavorite()
    } else {
      trackFavorite()
    }

    toggleFavorite(productId)
  }

  return (
    <button
      onClick={onClickButton}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur transition hover:scale-110"
      aria-label="Agregar a favoritos"
    >
      {isFavorite ? (
        <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" />
      ) : (
        <FontAwesomeIcon icon={faHeartRegular} className="h-5 w-5 text-slate-700" />
      )}
    </button>
  )
}
