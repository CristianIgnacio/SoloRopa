// src/components/ui/FavoriteButton.tsx
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useWishlistStore } from "../../Hooks/useWishlistStore"

type Props = {
  productId: string
}

function HeartOutlineIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 7.543c0-2.485-2.017-4.5-4.504-4.5-1.87 0-3.52 1.143-4.248 2.776-.728-1.633-2.378-2.776-4.248-2.776-2.487 0-4.504 2.015-4.504 4.5 0 7.2 8.752 11.457 8.752 11.457s8.752-4.257 8.752-11.457z"
      />
    </svg>
  )
}

function HeartSolidIcon({ className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M11.999 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.451 1.31z" />
    </svg>
  )
}


export default function FavoriteButton({ productId }: Props) {
  const toggleFavorite = useWishlistStore((s) => s.toggleFavorite)
  const isFavorite = useWishlistStore((s) => s.isFavorite(productId))
  const {user} = useUserStore()
  const navigate = useNavigate()

  const onClickButton = (e : any) => {
    e.stopPropagation()
    if(!user){
      navigate("/login")
    }
    toggleFavorite(productId)
  }

  return (
    <button
      onClick={onClickButton}
      className="rounded-full bg-white/80 p-1.5 shadow backdrop-blur transition hover:scale-110"
      aria-label="Agregar a favoritos"
    >
      {isFavorite ? (
        <HeartSolidIcon className="h-5 w-5 text-red-500" />
      ) : (
        <HeartOutlineIcon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  )
}
