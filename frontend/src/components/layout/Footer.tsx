// src/components/layout/Footer.tsx
import { Link } from "react-router-dom"

const COLUMNS = [
  {
    title: "Explorar",
    links: [
      { label: "Explorar", to: "/explore" },
      { label: "Novedades", to: "/search?sort=createdAt" },
      { label: "Ofertas", to: "/search?onSale=true" },
      { label: "Buscar", to: "/search" },
    ],
  },
  {
    title: "Categorías",
    links: [
      { label: "Poleras", to: "/search?category=poleras" },
      { label: "Polerones", to: "/search?category=polerones" },
      { label: "Pantalones", to: "/search?category=pantalones" },
      { label: "Accesorios", to: "/search?category=accesorios" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { label: "Ingresar", to: "/login" },
      { label: "Crear cuenta", to: "/register" },
      { label: "Favoritos", to: "/favorites" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-20 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-black uppercase leading-none tracking-tighter">SoloRopa</p>
          <p className="max-w-xs text-sm font-medium text-white/60">
            El agregador de streetwear chileno. Marcas locales, un solo lugar.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-yellow-400">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm font-medium text-white/80 transition-colors hover:text-yellow-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
          © {new Date().getFullYear()} SoloRopa · Hecho en Chile
        </p>
      </div>
    </footer>
  )
}
