// src/pages/Profile.tsx
import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import Avatar from "../components/ui/Avatar"
import wishlistServices from "../services/wishlist"
import userServices from "../services/users"
import type { User, Wishlist } from "../Types/Types"
// import { useUserStore } from "../Hooks/useStore"

export default function Profile() {
  const { username } = useParams()
  const [profile, setProfile] = useState<User | null>(null)
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return

    const load = async () => {
      setLoading(true)
      setNotFound(false)
      // 🔹 luego: endpoint real /users/:username
      try {
        const [profileData, wishlistData] = await Promise.all([
          userServices.getPublicProfile(username),
          wishlistServices.getUserWishlists(username),
        ])

        setProfile(profileData)
        setWishlists(wishlistData.data)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [username])


  if (loading) {
    return <p className="p-6 text-slate-500">Cargando perfil…</p>
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">
          Usuario no encontrado
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          El perfil que buscas no existe o fue eliminado.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Volver al inicio
        </Link>
      </section>
    )
  }

  if (!profile) {
    return null
  }


  console.log(wishlists)
  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      {/* HEADER */}
      <div className="flex items-center gap-6">
        <Avatar
          username={profile.username}
          src={profile.avatarUrl}
          size={96}
        />

        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black border-b-4 border-black pb-1">
            {profile.username}
          </h1>

          {profile.role && (
            <p className="mt-2 inline-block bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000]">
              {profile.role}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-800">
            <span className="border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000]">
              <span className="text-lg font-black text-black">{wishlists.length}</span> colecciones
            </span>
            {wishlists.length > 0 && (
              <span className="border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000]">
                <span className="text-lg font-black text-black">{wishlists[0].items.length}</span> favoritos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* COLECCIONES */}
      <div className="mt-16 border-t-4 border-black pt-8">
        <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter text-black">
          Colecciones
        </h2>

        {wishlists.length === 0 ? (
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Aún no hay colecciones públicas
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {wishlists.map((w : Wishlist) => (
              <div
                key={w.id}
                className="group rounded-none border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:bg-yellow-400 hover:shadow-[8px_8px_0_0_#000]"
              >
                <p className="text-lg font-black uppercase tracking-tighter text-black">{w.name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-900">
                  {w.items.length} productos
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
