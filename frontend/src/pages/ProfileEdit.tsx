// src/pages/ProfileEdit.tsx
import { useState } from "react"
import userServices from "../services/login"
import { useUserStore } from "../Hooks/useStore"
import Avatar from "../components/ui/Avatar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

const baseUrl = "http://localhost:3001"

export default function ProfileEdit() {
  const { user, login } = useUserStore()
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(baseUrl + user?.avatarUrl)
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const onPickFile = (file: File) => {
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!avatar) return

    const formData = new FormData()
    formData.append("avatar", avatar)

    setLoading(true)
    try {
      // Si tienes un servicio para actualizar, úsalo aquí. Por ahora está simulado re-logeando.
      // const updatedUser = await userServices.updateProfile(formData)
      const updatedUser = await userServices.logout()
      login(updatedUser) // actualiza store con nuevo avatarUrl
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black md:text-4xl">
          Editar perfil
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Personaliza tu identidad
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
          {/* Preview */}
          <div className="shrink-0 border-4 border-black">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-24 w-24 object-cover"
              />
            ) : (
              <Avatar username={user.username} src={user.avatarUrl} size={96} />
            )}
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            {/* Picker */}
            <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-black bg-black px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-yellow-400 hover:text-black hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none w-full sm:w-auto">
              <FontAwesomeIcon icon={faUpload} />
              Elegir nueva foto
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onPickFile(file)
                }}
              />
            </label>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Formatos aceptados: JPG, PNG
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!avatar || loading}
          className="w-full border-4 border-black bg-black px-6 py-4 font-black uppercase tracking-widest text-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-yellow-400 hover:text-black hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-black disabled:hover:text-white disabled:hover:shadow-[4px_4px_0_0_#000]"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  )
}
