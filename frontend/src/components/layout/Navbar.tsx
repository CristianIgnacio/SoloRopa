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
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons"


export default function Navbar() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Search states
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const POPULAR_SEARCHES = ["Poleras", "Oversize", "Zapatillas", "Pantalones Cargo", "Dark"]

  const navigate = useNavigate()
  const { user, logout } = useUserStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
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

        <div className="mx-4 flex flex-1 md:ml-8" ref={searchContainerRef}>
          <form 
            className="relative w-full group"
            onSubmit={(e) => {
              e.preventDefault();
              setShowSuggestions(false);
              if (searchValue?.trim()) navigate(`/search?q=${encodeURIComponent(searchValue)}`);
            }}
          >
            <input
              name="q"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
              placeholder="Buscar streetwear, dark..."
              className="w-full border-2 border-black bg-white py-2 pl-4 pr-10 text-sm font-bold shadow-[2px_2px_0_0_#000] placeholder:font-medium placeholder:text-slate-400 transition-all focus:outline-none focus:shadow-[4px_4px_0_0_#000]"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 flex h-full w-10 items-center justify-center border-l-2 border-transparent text-black transition-colors hover:bg-yellow-400 hover:border-black"
              aria-label="Buscar"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
            </button>

            {/* SUGERENCIAS DE BÚSQUEDA */}
            {showSuggestions && (
               <div className="absolute top-full left-0 mt-1 w-full border-2 border-black bg-white shadow-[4px_4px_0_0_#000] z-50">
                  <div className="bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                    {searchValue ? "Sugerencias" : "Búsquedas Populares"}
                  </div>
                  <ul>
                    {POPULAR_SEARCHES
                      .filter(term => term.toLowerCase().includes(searchValue.toLowerCase()))
                      .map(term => (
                      <li key={term}>
                        <button 
                          type="button"
                          className="w-full text-left px-4 py-2 text-xs font-bold border-b border-slate-100 hover:bg-yellow-400 transition-colors uppercase"
                          onClick={() => {
                            setSearchValue(term);
                            setShowSuggestions(false);
                            navigate(`/search?q=${encodeURIComponent(term)}`);
                          }}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 text-[10px] opacity-40" />
                          {term}
                        </button>
                      </li>
                    ))}
                    
                    {searchValue && POPULAR_SEARCHES.filter(term => term.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
                      <li>
                        <button 
                          type="button"
                          className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-yellow-400 transition-colors uppercase"
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate(`/search?q=${encodeURIComponent(searchValue)}`);
                          }}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 text-[10px] opacity-40" />
                          Ver resultados para "{searchValue}"
                        </button>
                      </li>
                    )}
                  </ul>
               </div>
            )}
          </form>
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
