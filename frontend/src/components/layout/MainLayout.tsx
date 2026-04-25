import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useEffect } from "react"
import loginServices from "../../services/login"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
// import Sidebar from "./Sidebar"

export default function MainLayout() {
  const { login, logout } = useUserStore()
  const navigate = useNavigate()
  const { loadFavorites } = useWishlistStore()

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

    // <div className="flex">
    //   <Sidebar />

    //   <div className=" flex min-h-screen flex-1 flex-col">
    //     <Navbar />
    //     <main className="pt-16">
    //       <Outlet />
    //     </main>
    //   </div>
    // </div>
  )
}