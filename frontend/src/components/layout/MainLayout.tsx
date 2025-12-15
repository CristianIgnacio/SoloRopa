import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useEffect } from "react"
import loginServices from "../../services/login"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useWishlistStore } from "../../Hooks/useWishlistStore"

export default function MainLayout() {
  const { login, logout } = useUserStore()
  const navigate = useNavigate()
  const { loadFavorites, favoriteIds } = useWishlistStore()

  console.log(favoriteIds)

  useEffect(() => {
    const init = async () => {
      const storedUser = await loginServices.restoreLogin()

      if (storedUser) {
        login(storedUser)
        await loadFavorites()
      } else {
        logout()
        navigate("/")
      }
    }

    init()
  }, [])
  
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}