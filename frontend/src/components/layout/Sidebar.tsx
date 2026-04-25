// src/components/layout/Sidebar.tsx
import { NavLink } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse, faCompass, faHeart, faGear } from "@fortawesome/free-solid-svg-icons"

const baseItem =
  "flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-slate-100"

const activeItem = "bg-slate-200 text-slate-900"

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-slate-200 bg-white py-4">
      {/* Logo / Home */}
      <NavLink
        to="/"
        end
        title="Inicio"
        className={({ isActive }) =>
          `${baseItem} ${isActive ? activeItem : "text-slate-1000"}`
        }
      >
        <FontAwesomeIcon icon={faHouse} className="text-lg" />
      </NavLink>

      {/* Navegación */}
      <div className="mt-6 flex flex-1 flex-col gap-3">
        <NavLink
          to="/search"
          title="Explorar"
          className={({ isActive }) =>
            `${baseItem} ${isActive ? activeItem : "text-slate-600"}`
          }
        >
          <FontAwesomeIcon icon={faCompass} className="text-lg" />
        </NavLink>

        <NavLink
          to="/favorites"
          title="Favoritos"
          className={({ isActive }) =>
            `${baseItem} ${isActive ? activeItem : "text-slate-600"}`
          }
        >
          <FontAwesomeIcon icon={faHeart} className="text-lg" />
        </NavLink>
      </div>

      {/* Ajustes */}
      <NavLink
        to="/profile/edit"
        title="Ajustes"
        className={({ isActive }) =>
          `${baseItem} ${isActive ? activeItem : "text-slate-600"}`
        }
      >
        <FontAwesomeIcon icon={faGear} className="text-lg" />
      </NavLink>
    </aside>
  )
}