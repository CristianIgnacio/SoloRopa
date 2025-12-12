// src/components/layout/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { useUserStore } from "../../Hooks/useStore"

export default function Navbar() {
  const navigate = useNavigate()
  const { user } = useUserStore()

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
              <Link to={`/profile/${user.username}`} className="h-8 w-8 rounded-full bg-slate-300" />
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
