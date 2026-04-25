import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { Product, Brand, Wishlist, WishlistItem } from "../Types/Types"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import wishlistServices from "../services/wishlist"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRight,
  faCircleNotch,
  faHatCowboy,
  faHeart,
  faMagnifyingGlass,
  faPlus,
  faShirt,
  faShoePrints,
  faShield,
  faVest,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons"

/* ─── Tipos ──────────────────────────────────────────────────── */

type OutfitSlotId = "top" | "mid" | "outer" | "bottom" | "shoes" | "accessory"

type OutfitSlot = {
  id: OutfitSlotId
  label: string
  hint: string
  categories: string[]
  optional?: boolean
  icon: typeof faShirt
}

const OUTFIT_SLOTS: OutfitSlot[] = [
  { id: "top", label: "Polera base", hint: "La capa que arranca el look", categories: ["poleras"], icon: faShirt },
  { id: "mid", label: "Polerón", hint: "Para sumar volumen y abrigo", categories: ["polerones"], icon: faVest, optional: true },
  { id: "outer", label: "Chaqueta", hint: "La pieza que remata arriba", categories: ["chaquetas"], icon: faShield, optional: true },
  { id: "bottom", label: "Parte baja", hint: "Pantalón o short según el mood", categories: ["pantalones", "shorts"], icon: faShirt },
  { id: "shoes", label: "Zapatillas", hint: "El cierre del outfit", categories: ["zapatillas"], icon: faShoePrints },
  { id: "accessory", label: "Accesorio", hint: "El detalle que le da personalidad", categories: ["accesorios"], icon: faHatCowboy, optional: true },
]

const STYLE_OPTIONS = ["streetwear", "dark", "vintage", "skate", "y2k", "minimal", "workwear"]
const COLOR_OPTIONS = ["negro", "blanco", "gris", "azul", "verde", "beige", "rojo"]
const GENDER_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Hombre", value: "hombre" },
  { label: "Mujer", value: "mujer" },
  { label: "Unisex", value: "unisex" },
]

type OutfitState = Record<OutfitSlotId, Product[]>

const emptyOutfitState = (): OutfitState => ({
  top: [], mid: [], outer: [], bottom: [], shoes: [], accessory: [],
})

const getProductImage = (product?: Product | null) => product?.images?.[0]?.src ?? ""

/* ─── Componente Principal ───────────────────────────────────── */

export default function OutfitBuilder() {
  const [selectedProducts, setSelectedProducts] = useState<OutfitState>(emptyOutfitState())
  const [activeSlot, setActiveSlot] = useState<OutfitSlotId>("top")

  // Filtros
  const [selectedStyle, setSelectedStyle] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("")
  const [query, setQuery] = useState("")
  const [viewFavorites, setViewFavorites] = useState(false)

  const [brands, setBrands] = useState<Brand[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])

  // Catálogo estado
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const PAGE_SIZE = 18

  // Cargar marcas iniciales
  useEffect(() => {
    brandsServices.getAllBrands().then(setBrands).catch(() => { })
  }, [])

  // Cargar favoritos
  useEffect(() => {
    const loadFavs = async () => {
      try {
        const wishlists = await wishlistServices.getMeWishlists()
        const defaultList = wishlists.data.find((w: Wishlist) => w.isDefault)
        if (defaultList?.items) {
          const validProducts = defaultList.items.map((item: WishlistItem) => item.productId).filter(Boolean) as Product[]
          setFavoriteProducts(validProducts)
        }
      } catch { }
    }
    loadFavs()
  }, [])

  // Cargar catálogo cada vez que cambia slot o filtro
  useEffect(() => {
    setPage(1)
    loadCatalog(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot, selectedStyle, selectedColor, selectedGender, selectedBrand, query, viewFavorites])

  const loadCatalog = async (pageToLoad: number, isNew: boolean) => {
    const slot = OUTFIT_SLOTS.find(s => s.id === activeSlot)!

    if (viewFavorites) {
      // Filtrar favoritos localmente en base a categorías del slot
      const filteredFavs = favoriteProducts.filter(p =>
        p.categories?.some(cat => slot.categories.includes(cat.name?.toLowerCase() || "")) ||
        p.tags?.some(tag => slot.categories.includes(tag.toLowerCase()))
      )
      setProducts(filteredFavs)
      setHasMore(false)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params: Record<string, any> = {
        limit: PAGE_SIZE,
        page: pageToLoad,
        sort: "trendingScore",
        order: "desc",
        category: slot.categories.join(","),
        inStock: "true",
      }
      if (selectedGender) params.gender = selectedGender
      if (selectedStyle) params.style = selectedStyle
      if (selectedColor) params.color = selectedColor
      if (selectedBrand) params.brand = selectedBrand
      if (query.trim()) params.q = query.trim()

      const response = await productsServices.getProducts(params)
      const data = response.data as Product[]

      setProducts(prev => isNew ? data : [...prev, ...data])
      setHasMore(data.length >= PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (loading || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    loadCatalog(nextPage, false)
  }

  const toggleProductInSlot = (product: Product) => {
    setSelectedProducts(prev => {
      const currentSlotProducts = prev[activeSlot]
      const exists = currentSlotProducts.some(p => p.id === product.id)

      return {
        ...prev,
        [activeSlot]: exists
          ? currentSlotProducts.filter(p => p.id !== product.id)
          : [...currentSlotProducts, product]
      }
    })
  }

  const removeProductFromSlot = (slotId: OutfitSlotId, productId: string, e: React.MouseEvent) => {
    e.stopPropagation() // evitar que active el slot
    setSelectedProducts(prev => ({
      ...prev,
      [slotId]: prev[slotId].filter(p => p.id !== productId)
    }))
  }

  const outfitPrice = useMemo(() => {
    let total = 0
    Object.values(selectedProducts).forEach(productsInSlot => {
      productsInSlot.forEach(p => {
        if (p.price) total += p.price
      })
    })
    return total
  }, [selectedProducts])

  const filledSlotsCount = useMemo(() => {
    return Object.values(selectedProducts).filter(arr => arr.length > 0).length
  }, [selectedProducts])

  const totalItemsCount = useMemo(() => {
    return Object.values(selectedProducts).reduce((acc, arr) => acc + arr.length, 0)
  }, [selectedProducts])

  const toggleFilter = (current: string, value: string) => current === value ? "" : value
  const activeFilterCount = [selectedStyle, selectedColor, selectedGender, selectedBrand].filter(Boolean).length

  return (
    <section className="min-h-screen bg-[#f3efe5] px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* ── HEADER ── */}
        <div className="mb-8 border-b-4 border-black pb-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Studio Focus</p>
          <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tighter text-black md:text-5xl">
            Arma tu Look
          </h1>
          <p className="mt-3 text-sm font-bold text-slate-600">
            Navega por cada pieza, explora opciones y apila tus prendas favoritas para visualizar el resultado final.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">

          {/* ── COLUMNA IZQUIERDA: Resumen del Outfit ── */}
          <aside className="space-y-4">

            {/* Box Total */}
            <div className="border-4 border-black bg-black p-5 shadow-[6px_6px_0_0_#facc15] text-white sticky top-24 z-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black">{totalItemsCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prendas en total</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{outfitPrice > 0 ? `$${outfitPrice.toLocaleString("es-CL")}` : "–"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total acumulado</p>
                </div>
              </div>
            </div>

            {/* Lista de Slots */}
            <div className="space-y-3">
              {OUTFIT_SLOTS.map((slot) => {
                const isActive = activeSlot === slot.id
                const slotProducts = selectedProducts[slot.id]
                const hasProducts = slotProducts.length > 0

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setActiveSlot(slot.id)}
                    className={`w-full border-4 p-4 text-left transition-all relative ${isActive
                        ? "border-yellow-400 bg-white shadow-[6px_6px_0_0_#facc15] -translate-y-1"
                        : "border-black bg-[#fffdf8] shadow-[4px_4px_0_0_#000] hover:bg-white"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400 border-2 border-black -z-10" />
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center border-2 border-black transition-colors ${isActive ? "bg-yellow-400" : "bg-slate-100"}`}>
                        <FontAwesomeIcon icon={slot.icon} className={isActive ? "text-black" : "text-slate-400"} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-tighter text-black flex items-center gap-2">
                          {slot.label}
                          {hasProducts && <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">{slotProducts.length}</span>}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{slot.hint}</p>
                      </div>
                    </div>

                    {/* Miniaturas de prendas elegidas */}
                    {hasProducts ? (
                      <div className="flex flex-wrap gap-2">
                        {slotProducts.map(product => (
                          <div key={product.id} className="relative h-16 w-16 group border-2 border-black bg-white">
                            <img src={getProductImage(product)} alt={product.title} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => removeProductFromSlot(slot.id, product.id, e)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-12 border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {slot.optional ? "Vacío (Opcional)" : "Haz clic para agregar"}
                        </p>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

          </aside>

          {/* ── COLUMNA DERECHA: Catálogo / Focus ── */}
          <div className="space-y-6">

            {/* Cabecera del Catálogo Activo */}
            <div className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b-2 border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Buscando prendas para</p>
                  <h2 className="text-2xl font-black uppercase text-black">{OUTFIT_SLOTS.find(s => s.id === activeSlot)?.label}</h2>
                </div>

                {/* Search & Favorites Toggle */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Buscar por texto..."
                      className="w-full border-2 border-black py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-yellow-400"
                    />
                  </div>
                  <button
                    onClick={() => setViewFavorites(!viewFavorites)}
                    className={`flex h-9 w-9 items-center justify-center border-2 border-black transition-colors ${viewFavorites ? "bg-red-500 text-white" : "bg-white text-slate-400 hover:text-red-500"
                      }`}
                    title="Ver mis favoritos"
                  >
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              {!viewFavorites && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Estilo */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estilo</p>
                    <div className="flex flex-wrap gap-1">
                      {STYLE_OPTIONS.map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(toggleFilter(selectedStyle, style))}
                          className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase transition-colors ${selectedStyle === style ? "bg-black text-white" : "bg-white hover:bg-yellow-400"
                            }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Color</p>
                    <div className="flex flex-wrap gap-1">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(toggleFilter(selectedColor, color))}
                          className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase transition-colors ${selectedColor === color ? "bg-yellow-400 text-black" : "bg-white hover:bg-slate-100"
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Género */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Género</p>
                    <div className="flex flex-wrap gap-1">
                      {GENDER_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedGender(toggleFilter(selectedGender, option.value))}
                          className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase transition-colors ${selectedGender === option.value ? "bg-black text-white" : "bg-white hover:bg-slate-100"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Marca */}
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Marca</p>
                    <div className="flex flex-wrap gap-1">
                      {brands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => setSelectedBrand(toggleFilter(selectedBrand, brand.id))}
                          className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase transition-colors ${selectedBrand === brand.id ? "bg-black text-white" : "bg-white hover:bg-slate-100"
                            }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Botón limpiar filtros */}
              {!viewFavorites && activeFilterCount > 0 && (
                <div className="mt-4 border-t-2 border-slate-100 pt-3">
                  <button
                    onClick={() => { setSelectedStyle(""); setSelectedColor(""); setSelectedGender(""); setSelectedBrand(""); setQuery("") }}
                    className="text-[10px] font-black uppercase tracking-widest text-red-500 underline"
                  >
                    Limpiar todos los filtros ({activeFilterCount})
                  </button>
                </div>
              )}
            </div>

            {/* Grilla de Productos */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((product) => {
                const isSelected = selectedProducts[activeSlot].some(p => p.id === product.id)

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProductInSlot(product)}
                    className={`group relative flex flex-col overflow-hidden border-4 text-left transition-all hover:-translate-y-1 ${isSelected
                        ? "border-yellow-400 bg-yellow-50 shadow-[4px_4px_0_0_#facc15]"
                        : "border-black bg-white shadow-[4px_4px_0_0_#000]"
                      }`}
                  >
                    <div className="aspect-[4/5] overflow-hidden border-b-4 border-black bg-slate-100">
                      <img
                        src={getProductImage(product)}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-yellow-600">{product.brand?.name ?? product.brand}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-tight text-black flex-1">{product.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-black text-black">${product.price?.toLocaleString("es-CL")}</p>
                      </div>
                    </div>

                    {/* Checkmark overlay */}
                    {isSelected && (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_0_#000]">
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                      </div>
                    )}

                    {/* Hover add/remove label */}
                    <div className={`absolute bottom-full left-0 right-0 border-y-4 border-black bg-black p-2 text-center text-[10px] font-black uppercase tracking-widest text-white transition-transform duration-200 group-hover:translate-y-full ${isSelected ? "bg-red-500" : ""}`}>
                      {isSelected ? "Quitar prenda" : "Agregar prenda"}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="flex h-64 flex-col items-center justify-center border-4 border-dashed border-black bg-white p-6 text-center">
                <FontAwesomeIcon icon={faShirt} className="mb-4 text-4xl text-slate-300" />
                <p className="text-lg font-black uppercase text-black">No encontramos prendas</p>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {viewFavorites
                    ? "No tienes favoritos guardados en esta categoría."
                    : "Intenta cambiar los filtros o buscar con otras palabras."}
                </p>
              </div>
            )}

            {/* Load More */}
            {hasMore && !viewFavorites && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="flex items-center gap-2 border-4 border-black bg-white px-8 py-4 text-sm font-black uppercase tracking-widest transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <><FontAwesomeIcon icon={faCircleNotch} spin /> Cargando...</>
                  ) : (
                    <><FontAwesomeIcon icon={faPlus} /> Cargar más prendas</>
                  )}
                </button>
              </div>
            )}

            {/* Loading Indicator for initial load */}
            {loading && products.length === 0 && (
              <div className="flex h-64 items-center justify-center text-lg font-black uppercase text-slate-400">
                <FontAwesomeIcon icon={faCircleNotch} spin className="mr-3 text-yellow-500" />
                Buscando...
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}
