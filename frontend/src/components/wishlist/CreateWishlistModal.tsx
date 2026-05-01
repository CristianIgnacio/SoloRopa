import { useState } from "react"
import Modal from "../ui/Modal"
import wishlistServices from "../../services/wishlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark, faPlus, faGlobe, faLock } from "@fortawesome/free-solid-svg-icons"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
import type { Wishlist } from "../../Types/Types"
import { useEffect } from "react"

type Props = {
  open: boolean
  onClose: () => void
  initialData?: Wishlist
  onSuccess?: (wishlist: Wishlist) => void
}

export default function CreateWishlistModal({ open, onClose, initialData, onSuccess }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { loadFavorites } = useWishlistStore()

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "")
      setDescription(initialData?.description || "")
      setVisibility(initialData?.visibility === "public" ? "public" : "private")
      setError("")
    }
  }, [open, initialData])

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("El nombre de la colección es obligatorio.")
      return
    }

    setLoading(true)
    setError("")

    try {
      let result;
      if (initialData) {
        // Edit mode
        result = await wishlistServices.updateWishlist({
          id: initialData.id,
          name: name.trim(),
          description: description.trim(),
          visibility
        })
      } else {
        // Create mode
        result = await wishlistServices.createWishlist({
          name: name.trim(),
          description: description.trim(),
          visibility,
          isDefault: false
        })
      }
      
      // Refrescar las colecciones en el store global
      await loadFavorites()
      
      if (onSuccess && result?.data) {
        onSuccess(result.data)
      }
      
      handleClose()
    } catch (err: any) {
      console.error(err)
      setError(`Hubo un error al ${initialData ? "editar" : "crear"} la colección.`)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="relative p-2">
        <button
          onClick={handleClose}
          className="absolute -right-2 -top-2 z-50 flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-black transition-colors hover:bg-black hover:text-white shadow-[2px_2px_0_0_#000]"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="mb-6 border-b-4 border-black pb-2 text-2xl font-black uppercase tracking-tighter text-black">
          {initialData ? "Editar Colección" : "Nueva Colección"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ropa de invierno"
              disabled={initialData?.isSystem}
              className="w-full rounded-none border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[4px_4px_0_0_#000] focus:outline-none focus:shadow-[6px_6px_0_0_#000] transition-all disabled:bg-slate-100 disabled:text-slate-500"
            />
            {initialData?.isSystem && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                El nombre de esta colección no puede ser modificado.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700">
              Descripción (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Mi selección para el frío..."
              rows={3}
              className="w-full resize-none rounded-none border-2 border-black bg-white px-4 py-3 font-bold text-black shadow-[4px_4px_0_0_#000] focus:outline-none focus:shadow-[6px_6px_0_0_#000] transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700">
              Privacidad
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex flex-1 items-center justify-center gap-2 border-2 border-black px-4 py-3 font-bold uppercase tracking-widest transition-all ${
                  visibility === "private"
                    ? "bg-black text-white shadow-[4px_4px_0_0_#000]"
                    : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                <FontAwesomeIcon icon={faLock} />
                Privada
              </button>
              
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex flex-1 items-center justify-center gap-2 border-2 border-black px-4 py-3 font-bold uppercase tracking-widest transition-all ${
                  visibility === "public"
                    ? "bg-green-400 text-black shadow-[4px_4px_0_0_#000]"
                    : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} />
                Pública
              </button>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              {visibility === "private" 
                ? "Solo tú puedes ver esta colección." 
                : "Aparecerá en tu perfil público."}
            </p>
          </div>

          {error && (
            <p className="text-sm font-bold uppercase tracking-widest text-red-500 border-2 border-red-500 bg-red-50 p-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 border-4 border-black bg-yellow-400 py-4 text-lg font-black uppercase tracking-widest text-black shadow-[6px_6px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] active:translate-y-0 active:shadow-none disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            {loading ? "Guardando..." : (initialData ? "Guardar Cambios" : "Crear Colección")}
          </button>
        </form>
      </div>
    </Modal>
  )
}
