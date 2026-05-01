// src/pages/FavoritesDetail.tsx
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import wishlistServices from "../services/wishlist"
import type { Wishlist, WishlistItem } from "../Types/Types"
import FavoriteItemCard from "../components/wishlist/FavoriteItemCard"
import { useUserStore } from "../Hooks/useStore"
import ShareButton from "../components/ui/ShareButton"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe, faLock, faEllipsisVertical, faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
import CreateWishlistModal from "../components/wishlist/CreateWishlistModal"

export default function FavoritesDetail() {
  const { id } = useParams()
  const { user } = useUserStore()
  const navigate = useNavigate()

  const [wishlist, setWishlist] = useState<Wishlist>()
  const [loading, setLoading] = useState(true)
  const [updatingVis, setUpdatingVis] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    const init = async () => {
      try {
        const wishlistDetailData = await wishlistServices.getWishlistById(id ?? '')
        setWishlist(wishlistDetailData.data)
      } catch (err: any) {
        setError("No se pudo cargar la colección o es privada.")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  const onRemoved = (productId : string) => {
    setWishlist((prev: any) => ({
      ...prev,
      items: prev.items.filter(
        (i: any) => i.productId.id !== productId
      ),
    }))
  }

  const handleToggleVisibility = async () => {
    if (!wishlist) return
    const newVisibility = wishlist.visibility === "public" ? "private" : "public"
    setUpdatingVis(true)
    try {
      await wishlistServices.updateWishlist({
        id: wishlist.id,
        visibility: newVisibility
      })
      setWishlist({ ...wishlist, visibility: newVisibility })
    } catch (err) {
      console.error("Error updating visibility", err)
    } finally {
      setUpdatingVis(false)
    }
  }

  const handleDelete = async () => {
    if (!wishlist) return
    const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar la colección "${wishlist.name}"? Esta acción no se puede deshacer.`)
    if (!confirmDelete) return

    try {
      await wishlistServices.deleteWishlist(wishlist.id)
      navigate("/favorites")
    } catch (err) {
      console.error("Error eliminando wishlist", err)
      alert("No se pudo eliminar la colección.")
    }
  }

  if (loading) {
    return <p className="p-6 text-slate-500">Cargando colección...</p>
  }

  if (error || !wishlist) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium text-slate-700">{error || "Colección no encontrada"}</p>
      </div>
    )
  }
    
  const ownerId = typeof wishlist.userId === "string" ? wishlist.userId : (wishlist.userId as any)?._id || (wishlist.userId as any)?.id;
  const ownerUsername = typeof wishlist.userId !== "string" ? (wishlist.userId as any)?.username : undefined;

  const isOwner = user?.id === ownerId;
  const isPublic = wishlist.visibility === "public"

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-8 border-b-4 border-black pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {ownerUsername && (
              <a 
                href={`/profile/${ownerUsername}`} 
                className="mb-2 inline-block border-2 border-black bg-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000] transition-colors hover:bg-black hover:text-white"
              >
                @{ownerUsername}
              </a>
            )}
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">{wishlist.name}</h1>
            {wishlist.description && (
              <p className="mt-2 text-sm text-slate-700 max-w-2xl">
                {wishlist.description}
              </p>
            )}
            <p className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-600">
              {wishlist.items.length} productos guardados
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isOwner && (
              <button
                onClick={handleToggleVisibility}
                disabled={updatingVis}
                className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
                  isPublic 
                    ? "bg-green-400 text-black shadow-[2px_2px_0_0_#000]" 
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                } ${updatingVis ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
              >
                <FontAwesomeIcon icon={isPublic ? faGlobe : faLock} />
                {isPublic ? "Pública" : "Privada"}
              </button>
            )}
            
            {(isOwner || isPublic) && (
              <div className="flex items-center gap-2 border-2 border-black bg-white p-1 shadow-[2px_2px_0_0_#000]">
                <ShareButton url={window.location.href} />
                <span className="pr-2 text-xs font-bold uppercase tracking-widest text-black">Compartir</span>
              </div>
            )}

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-yellow-400 shadow-[2px_2px_0_0_#000]"
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 top-12 z-20 w-48 border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setIsEditModalOpen(true)
                      }}
                      className="flex w-full items-center gap-3 border-b-2 border-black px-4 py-3 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-yellow-400"
                    >
                      <FontAwesomeIcon icon={faPen} /> Editar
                    </button>
                    {!wishlist.isSystem && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          handleDelete()
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {wishlist.items.length === 0 ? (
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No hay productos aún.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {wishlist.items.map((item: WishlistItem) => (
            <FavoriteItemCard
              key={item.productId.id}
              item={item.productId}
              wishlistId={wishlist.id}
              onRemoved={(productId) => onRemoved(productId)}
            />
          ))}
        </div>
      )}
      
      {isOwner && (
        <CreateWishlistModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={wishlist}
          onSuccess={(updatedData) => setWishlist(updatedData)}
        />
      )}
    </section>
  )
}
