// src/pages/CardsShowcase.tsx
// Catálogo visual de todas las cards de producto que existen en el proyecto.
import { useEffect, useState, type ReactNode } from "react"
import productsServices from "../services/products"
import type { Product, Wishlist } from "../Types/Types"
import ProductCard from "../components/product/ProductCard"
import ProductCardDots from "../components/product/ProductCardDots"
import ProductCardHover from "../components/product/ProductCardHover"
import ProductShowcaseCard from "../components/product/ProductShowcaseCard"
import ProductCardSkeleton from "../components/product/ProductCardSkeleton"
import EditorialProductCard from "../components/explore/EditorialProductCard"
import FavoriteItemCard from "../components/wishlist/FavoriteItemCard"
import WishlistCard from "../components/wishlist/WishlistCard"
import ProductQuickView from "../components/product/ProductQuickView"

type ShowcaseItem = {
  id: string
  name: string
  file: string
  usedIn: string
  description: string
  grid?: string
  render: (product: Product, index: number) => ReactNode
}

const GRID_4 = "grid grid-cols-2 gap-4 md:grid-cols-4"

const makeWishlist = (name: string, products: Product[], isDefault = false): Wishlist => ({
  id: `demo-${name}`,
  userId: "demo",
  name,
  description: "Lista de ejemplo",
  items: products.map((p) => ({ productId: p, addedAt: new Date() })),
  visibility: "public",
  isDefault,
  isSystem: false,
  createdAt: new Date(),
})

export default function CardsShowcase() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quickView, setQuickView] = useState<Product | null>(null)
  const [active, setActive] = useState<string>("all")

  useEffect(() => {
    window.scrollTo(0, 0)
    productsServices
      .getProducts({ page: 1, limit: 8, sort: "trendingScore", order: "desc", inStock: true })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false))
  }, [])

  const open = (p: Product) => setQuickView(p)

  const items: ShowcaseItem[] = [
    {
      id: "hover-default",
      name: "ProductCardHover · default",
      file: "components/product/ProductCardHover.tsx",
      usedIn: "Home, Search",
      description: "Borde negro y sombra dura al hover. Info sobre la imagen solo en escritorio.",
      render: (p) => <ProductCardHover product={p} onClick={() => open(p)} />,
    },
    {
      id: "hover-clean",
      name: "ProductCardHover · clean",
      file: "components/product/ProductCardHover.tsx",
      usedIn: "Explore (Todos los productos)",
      description: "variant=\"clean\": sin borde, sombra ni redondeo. Degradado suave al hover.",
      render: (p) => <ProductCardHover product={p} variant="clean" onClick={() => open(p)} />,
    },
    {
      id: "hover-natural",
      name: "ProductCardHover · natural (default vs clean)",
      file: "components/product/ProductCardHover.tsx",
      usedIn: "Grillas masonry",
      description: "imageMode=\"natural\": la card toma el alto real de la imagen. Izquierda default, derecha clean.",
      grid: "grid grid-cols-2 items-start gap-4 md:grid-cols-4",
      render: (p, i) => (
        <ProductCardHover product={p} imageMode="natural" variant={i % 2 ? "clean" : "default"} onClick={() => open(p)} />
      ),
    },
    {
      id: "editorial",
      name: "EditorialProductCard",
      file: "components/explore/EditorialProductCard.tsx",
      usedIn: "Explore (Nuevas llegadas, Destacados, Marca de la semana)",
      description: "Limpia, info debajo de la imagen, 2ª foto y favorito al hover en escritorio.",
      render: (p) => <EditorialProductCard product={p} onClick={() => open(p)} />,
    },
    {
      id: "dots",
      name: "ProductCardDots · default",
      file: "components/product/ProductCardDots.tsx",
      usedIn: "Sin uso actualmente",
      description: "Borde negro, puntos para cambiar de imagen y altura de info fija.",
      render: (p) => <ProductCardDots product={p} onClick={() => open(p)} />,
    },
    {
      id: "dots-clean",
      name: "ProductCardDots · clean",
      file: "components/product/ProductCardDots.tsx",
      usedIn: "Sin uso actualmente",
      description: "variant=\"clean\": sin borde ni sombra, puntos para cambiar de imagen e info debajo.",
      render: (p) => <ProductCardDots product={p} variant="clean" onClick={() => open(p)} />,
    },
    {
      id: "showcase",
      name: "ProductShowcaseCard",
      file: "components/product/ProductShowcaseCard.tsx",
      usedIn: "Sin uso actualmente (antes Marca de la semana)",
      description: "Card compacta para vitrinas de marca.",
      render: (p) => <ProductShowcaseCard product={p} onClick={() => open(p)} />,
    },
    {
      id: "basic",
      name: "ProductCard",
      file: "components/product/ProductCard.tsx",
      usedIn: "Sin uso actualmente",
      description: "La card original: redondeada, sombra suave, estilo genérico.",
      render: (p) => <ProductCard product={p} />,
    },
    {
      id: "favorite-item",
      name: "FavoriteItemCard",
      file: "components/wishlist/FavoriteItemCard.tsx",
      usedIn: "Detalle de lista de favoritos",
      description: "Card dentro de una lista guardada. Aquí el botón de eliminar está desactivado.",
      render: (p) => (
        <div
          // Bloquea el botón de eliminar para no borrar nada real desde la demo
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("button")) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <FavoriteItemCard item={p} wishlistId="demo" onRemoved={() => {}} />
        </div>
      ),
    },
  ]

  const filters = [
    { id: "all", name: "Todas" },
    ...items.map((i) => ({ id: i.id, name: i.name })),
    { id: "wishlist", name: "WishlistCard" },
    { id: "skeleton", name: "ProductCardSkeleton" },
  ]
  const visible = active === "all" ? items : items.filter((i) => i.id === active)
  const sample = products.slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-8">
      <header className="mb-8 border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-black md:text-6xl">
          Cards
        </h1>
        <p className="mt-2 max-w-xl text-sm font-medium text-slate-700">
          Todas las cards de producto del proyecto, con productos reales, para compararlas lado a lado.
        </p>
      </header>

      {/* Filtro rápido */}
      <div className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={`shrink-0 border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
              active === f.id ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {visible.map((item) => (
          <article key={item.id}>
            <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-black md:text-3xl">
                  {item.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                <code className="bg-slate-200 px-2 py-1 normal-case tracking-normal text-slate-700">{item.file}</code>
                <span className={`px-2 py-1 ${item.usedIn.startsWith("Sin uso") ? "bg-slate-200 text-slate-500" : "bg-yellow-400 text-black"}`}>
                  {item.usedIn}
                </span>
              </div>
            </div>

            <div className={item.grid ?? GRID_4}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : sample.map((p, i) => <div key={p.id}>{item.render(p, i)}</div>)}
            </div>
          </article>
        ))}

        {/* Cards que no son de un producto individual */}
        {(active === "all" || active === "wishlist") && (
          <article>
            <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-black md:text-3xl">
                  WishlistCard
                </h2>
                <p className="mt-1 text-sm text-slate-600">Portada de una lista: collage según cuántos productos tenga (0, 1, 2-3, 4+).</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                <code className="bg-slate-200 px-2 py-1 normal-case tracking-normal text-slate-700">components/wishlist/WishlistCard.tsx</code>
                <span className="bg-yellow-400 px-2 py-1 text-black">Perfil</span>
              </div>
            </div>
            <div className={GRID_4}>
              {!loading && (
                <>
                  <WishlistCard wishlist={makeWishlist("Vacía", [], true)} />
                  <WishlistCard wishlist={makeWishlist("Una prenda", products.slice(0, 1))} />
                  <WishlistCard wishlist={makeWishlist("Tres prendas", products.slice(1, 4))} />
                  <WishlistCard wishlist={makeWishlist("Outfit completo", products.slice(4, 8))} />
                </>
              )}
            </div>
          </article>
        )}

        {(active === "all" || active === "skeleton") && (
          <article>
            <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-black md:text-3xl">
                  ProductCardSkeleton
                </h2>
                <p className="mt-1 text-sm text-slate-600">Placeholder mientras cargan los productos.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                <code className="bg-slate-200 px-2 py-1 normal-case tracking-normal text-slate-700">components/product/ProductCardSkeleton.tsx</code>
                <span className="bg-yellow-400 px-2 py-1 text-black">Estados de carga</span>
              </div>
            </div>
            <div className={GRID_4}>
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </article>
        )}
      </div>

      <ProductQuickView product={quickView} open={!!quickView} onClose={() => setQuickView(null)} />
    </section>
  )
}
