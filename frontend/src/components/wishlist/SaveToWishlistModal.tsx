import { useState } from "react"
import Modal from "../ui/Modal"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import wishlistServices from "../../services/wishlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons"
import CreateWishlistModal from "./CreateWishlistModal"

type Props = {
  open: boolean
  onClose: () => void
  productId: string
}

export default function SaveToWishlistModal({ open, onClose, productId }: Props) {
  const { wishlist, loadFavorites } = useWishlistStore()
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Solo colecciones creadas por el usuario (sin sistema, sin Favoritos, sin Vistos Recientemente)
  const SYSTEM_NAMES = ["Favoritos", "Vistos Recientemente"]
  const validWishlists = wishlist.filter(
    (w) => !w.isSystem && !w.isDefault && !SYSTEM_NAMES.includes(w.name)
  )

  const handleToggle = async (wishlistId: string, isCurrentlySaved: boolean) => {
    setLoadingIds((prev) => new Set(prev).add(wishlistId))
    try {
      if (isCurrentlySaved) {
        await wishlistServices.deleteItemToWishlist(wishlistId, productId)
      } else {
        await wishlistServices.addItemToWishlist(wishlistId, productId)
      }
      await loadFavorites()
    } catch (err) {
      console.error("Error toggling item in wishlist", err)
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(wishlistId)
        return next
      })
    }
  }

  if (!open) return null

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="relative p-2">
          <button
            onClick={onClose}
            className="absolute -right-2 -top-2 z-50 flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-black hover:text-white"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <h2 className="mb-4 border-b-4 border-black pb-2 text-2xl font-black uppercase tracking-tighter text-black">
            Guardar en...
          </h2>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {validWishlists.map((w) => {
              const isSaved = w.items.some((item: any) => {
                const prod = item.productId
                const id = prod?.id || prod?._id || prod
                return id === productId
              })
              
              const isLoading = loadingIds.has(w.id)

              return (
                <button
                  key={w.id}
                  disabled={isLoading}
                  onClick={() => handleToggle(w.id, isSaved)}
                  className={`flex items-center justify-between border-2 border-black px-4 py-3 text-left font-bold uppercase tracking-widest transition-all ${
                    isSaved
                      ? "bg-yellow-400 text-black shadow-[4px_4px_0_0_#000]"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="truncate pr-4">{w.name}</span>
                  <div className={`flex h-5 w-5 items-center justify-center border-2 border-black bg-white ${isSaved ? "bg-black text-white" : ""}`}>
                    {isSaved && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-dashed border-black bg-slate-50 py-3 text-sm font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-100"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Colección
          </button>
        </div>
      </Modal>

      <CreateWishlistModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async (newWishlist) => {
          // Si creamos una nueva lista desde aquí, podríamos agregarle el producto automáticamente
          try {
            await wishlistServices.addItemToWishlist(newWishlist.id, productId)
            await loadFavorites()
          } catch (e) {
            console.error(e)
          }
          setIsCreateOpen(false)
        }}
      />
    </>
  )
}
