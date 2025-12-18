// src/pages/ProfileEdit.tsx
import { useState } from "react"
import userServices from "../services/login"
import { useUserStore } from "../Hooks/useStore"
import Avatar from "../components/ui/Avatar"

const baseUrl = "http://localhost:3001"

export default function ProfileEdit() {
  const { user, login } = useUserStore()
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(baseUrl + user?.avatarUrl)
  const [loading, setLoading] = useState(false)

  console.log(preview)

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
    //   const updatedUser = await userServices.updateProfile(formData)
      const updatedUser = await userServices.logout()
      login(updatedUser) // actualiza store con nuevo avatarUrl
    } finally {
      setLoading(false)
    }
  }


  return (
    <section className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-xl font-semibold">Editar perfil</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cambia tu foto de perfil
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <div className="flex items-center gap-4">
          {/* Preview */}
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <Avatar username={user.username} src={user.avatarUrl} size={80} />
          )}

          {/* Picker */}
          <label className="cursor-pointer rounded-md border bg-white px-4 py-2 text-sm hover:bg-slate-50">
            Elegir foto
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
        </div>

        <button
          type="submit"
          disabled={!avatar || loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </section>
  )
}
