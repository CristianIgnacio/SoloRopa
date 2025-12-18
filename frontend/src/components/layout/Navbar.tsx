// src/components/layout/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"
import { useEffect, useRef, useState } from "react"
import loginServices from "../../services/login"
import Avatar from "../ui/Avatar"


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
  }
  catch(error){
    console.log(error)
  }
}

return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">

        <Link to="/" className="text-lg font-semibold">
          SoloRopa
        </Link>

        <div className="flex flex-1">
          <input
            placeholder="Buscar productos o marcas…"
            className="w-full rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search?q=${(e.target as HTMLInputElement).value}`)
              }
            }}
          />
        </div>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/favorites" className="text-sm hover:underline">
                Favoritos
              </Link>
              <Link to="/explore" className="text-sm hover:underline">
                Explorar
              </Link>
              {/* Avatar dropdown */}
              <div ref={dropdownRef} className="relative">

                <button
                  onClick={() => setOpen((prev) => !prev)}
                  className="rounded-full"
                >
                  <Avatar
                    username={user.username}
                    src={user.avatarUrl}
                    size={40}
                  />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border bg-white shadow-lg p-1">
                    {/* Header usuario */}
                    <div className="flex items-center gap-3 border-b px-4 py-3">
                      <Avatar username={user.username} src={user.avatarUrl} size={36} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.username}</p>
                        {user.email && (
                          <p className="truncate text-xs text-slate-500">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Ver perfil
                    </Link>

                    {/* <Link
                      to="/profile/edit"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Editar perfil
                    </Link> */}

                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  )
}
