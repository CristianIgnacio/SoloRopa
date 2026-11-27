import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useEffect } from "react"
import loginServices from "../../services/login"
import { useUserStore } from "../../Hooks/useStore"
import { useWishlistStore } from "../../Hooks/useWishlistStore"
// import Sidebar from "./Sidebar"

export default function MainLayout() {
  const { login, logout } = useUserStore()
  const { loadFavorites } = useWishlistStore()

  useEffect(() => {
    const init = async () => {
      const storedUser = await loginServices.restoreLogin()

      if (storedUser) {
        login(storedUser)
        await loadFavorites()
      } else {
        // Sin sesión solo limpiamos el estado: las rutas públicas deben
        // seguir accesibles y PrivateRoute ya redirige a /login cuando toca.
        logout()
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