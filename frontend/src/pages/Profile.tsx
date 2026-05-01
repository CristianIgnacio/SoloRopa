// src/pages/Profile.tsx
import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import Avatar from "../components/ui/Avatar"
import wishlistServices from "../services/wishlist"
import userServices from "../services/users"
import type { User, Wishlist } from "../Types/Types"
import WishlistCard from "../components/wishlist/WishlistCard"
import ShareButton from "../components/ui/ShareButton"
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


  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      {/* HEADER */}
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-4 sm:gap-6 border-b-4 border-black pb-4">
        <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6">
          <Avatar
            username={profile.username}
            src={profile.avatarUrl}
            size={96}
          />

          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black pb-1">
              {profile.username}
            </h1>

            {profile.role && (
              <p className="mt-2 inline-block bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000]">
                {profile.role}
              </p>
            )}

            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-slate-800">
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
        
        <div className="mt-4 sm:mt-0 self-center sm:self-start">
          <div className="flex items-center gap-2 border-2 border-black bg-white p-1 shadow-[2px_2px_0_0_#000]">
            <ShareButton url={window.location.href} />
            <span className="pr-2 text-xs font-bold uppercase tracking-widest text-black">Compartir</span>
          </div>
        </div>
      </div>

      {/* COLECCIONES */}
      <div className="mt-8">
        <h2 className="mb-6 text-2xl font-black uppercase tracking-tighter text-black">
          Colecciones
        </h2>

        {wishlists.length === 0 ? (
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Aún no hay colecciones públicas
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {wishlists.map((w: Wishlist) => (
              <WishlistCard key={w.id} wishlist={w} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
