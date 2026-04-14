// src/components/layout/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useEffect, useRef, useState } from "react"
import loginServices from "../../services/login"
import Avatar from "../ui/Avatar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMagnifyingGlass,
  faHeart,
  faCompass,
  faRightToBracket,
  faUserPlus,
  faUser,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons"


export default function Navbar() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, logout } = useUserStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await loginServices.logout()
      logout()
      setOpen(false)
      navigate("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b-4 border-black bg-[#F4F4F0]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">

        <Link to="/" className="text-2xl font-black uppercase tracking-tighter hover:text-yellow-500 transition-colors">
          SoloRopa
        </Link>

        <div className="flex flex-1">
          <div className="relative w-full">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black"
            />
            <input
              placeholder="Buscar productos o marcas…"
              className="w-full border-2 border-black bg-white py-2 pl-9 pr-4 text-sm font-medium shadow-[2px_2px_0_0_#000] transition-all focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/search?q=${(e.target as HTMLInputElement).value}`)
                }
              }}
            />
          </div>
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/favorites" className="flex items-center gap-1.5 px-3 py-1 text-sm font-bold uppercase tracking-wider text-black border-2 border-transparent transition-all hover:border-black hover:bg-yellow-400">
                <FontAwesomeIcon icon={faHeart} className="text-xs" />
                Favoritos
              </Link>
              <Link to="/explore" className="flex items-center gap-1.5 px-3 py-1 text-sm font-bold uppercase tracking-wider text-black border-2 border-transparent transition-all hover:border-black hover:bg-yellow-400">
                <FontAwesomeIcon icon={faCompass} className="text-xs" />
                Explorar
              </Link>
              {/* Avatar dropdown */}
              <div ref={dropdownRef} className="relative">

                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="transition-transform active:translate-y-px"
                >
                  <Avatar
                    username={user.username}
                    src={user.avatarUrl}
                    size={40}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-none border-2 border-black bg-white p-1 shadow-[4px_4px_0_0_#000]">
                    {/* Header usuario */}
                    <div className="flex items-center gap-3 border-b-2 border-black px-4 py-3">
                      <Avatar username={user.username} src={user.avatarUrl} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black uppercase tracking-tighter text-black">{user.username}</p>
                        {user.email && (
                          <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-yellow-400"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 text-black" />
                      Ver perfil
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 border-t-2 border-black px-4 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-yellow-400"
                      >
                        <FontAwesomeIcon icon={faShieldHalved} className="w-4 text-black" />
                        Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t-2 border-black bg-black px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-500"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 px-3 py-1 text-sm font-bold uppercase tracking-wider text-black hover:underline">
                <FontAwesomeIcon icon={faRightToBracket} className="text-xs" />
                Ingresar
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 border-2 border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:text-black active:scale-95"
              >
                <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                Crear cuenta
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  )
}
