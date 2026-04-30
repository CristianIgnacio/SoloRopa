import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type { Product, Brand } from "../Types/Types"
import ProductCardHover from "../components/product/ProductCardHover"
import ProductCardSkeleton from "../components/product/ProductCardSkeleton"
import ProductQuickView from "../components/product/ProductQuickView"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faFilter, faTimes, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"

const PAGE_SIZE = 24

const CATEGORIES = ["poleras", "polerones", "pantalones", "shorts", "chaquetas", "zapatillas", "accesorios", "otros"]
const GENDERS    = ["hombre", "mujer", "unisex"]
const FITS    = ["oversize", "boxy", "slim", "baggy", "relaxed", "cropped", "regular"]
const STYLES  = ["streetwear", "dark", "vintage", "skate", "y2k", "urbano", "minimal", "workwear", "goth", "outdoor"]
const COLORS  = ["negro", "blanco", "gris", "azul", "rojo", "verde", "cafe", "beige", "naranja", "morado", "rosado", "stone"]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filtros del estado local (sincronizados con la URL)
  const initialQ          = searchParams.get("q") || ""
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || []
  const initialGenders    = searchParams.get("gender")?.split(",").filter(Boolean) || []
  const initialBrand      = searchParams.get("brand") || ""
  const initialSort       = searchParams.get("sort") || "createdAt"
  const initialFit        = searchParams.get("fit")?.split(",").filter(Boolean) || []
  const initialStyle      = searchParams.get("style")?.split(",").filter(Boolean) || []
  const initialColor      = searchParams.get("color")?.split(",").filter(Boolean) || []
  const initialInStock    = searchParams.get("inStock") === "true"
  const initialPage       = parseInt(searchParams.get("page") || "1", 10)

  const [q, setQ]                   = useState(initialQ)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [genders, setGenders]       = useState<string[]>(initialGenders)
  const [brand, setBrand]           = useState(initialBrand)
  const [sort, setSort]             = useState(initialSort)
  const [fits, setFits]             = useState<string[]>(initialFit)
  const [styles, setStyles]         = useState<string[]>(initialStyle)
  const [colors, setColors]         = useState<string[]>(initialColor)
  const [inStock, setInStock]       = useState(initialInStock)
  const [page, setPage]             = useState(initialPage)

  // Datos
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands]     = useState<Brand[]>([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(false)

  // UI States
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)
  const [quickViewProduct, setQuickViewProduct]   = useState<Product | null>(null)

  // Helpers para togglear checkboxes de arrays
  const toggleItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  // Cargar marcas
  useEffect(() => {
    brandsServices.getAllBrands().then(setBrands)
  }, [])

  // Buscar productos
  const fetchProducts = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: PAGE_SIZE,
        q: q || undefined,
        category: categories.length ? categories.join(",") : undefined,
        gender: genders.length ? genders.join(",") : undefined,
        brand: brand || undefined,
        sort: sort || undefined,
        fit:   fits.length   ? fits.join(",")   : undefined,
        style: styles.length ? styles.join(",") : undefined,
        color: colors.length ? colors.join(",") : undefined,
        inStock: inStock ? "true" : undefined,
      }

      const res = await productsServices.getProducts(params)

      setProducts(res.data)
      setTotal(res.total)
      setTotalPages(res.pages ?? Math.ceil(res.total / PAGE_SIZE))
    } finally {
      setLoading(false)
    }
  }, [q, categories, genders, brand, sort, fits, styles, colors, inStock])

  // Sync URL → estado cuando los filtros cambian (resetea a página 1)
  useEffect(() => {
    const params = new URLSearchParams()
    if (q)                       params.set("q", q)
    if (categories.length)       params.set("category", categories.join(","))
    if (genders.length)          params.set("gender", genders.join(","))
    if (brand)                   params.set("brand", brand)
    if (sort !== "createdAt")    params.set("sort", sort)
    if (fits.length)             params.set("fit",   fits.join(","))
    if (styles.length)           params.set("style", styles.join(","))
    if (colors.length)           params.set("color", colors.join(","))
    if (inStock)                 params.set("inStock", "true")
    params.set("page", "1")

    setSearchParams(params, { replace: true })
    setPage(1)
    fetchProducts(1)
  }, [q, categories, genders, brand, sort, fits, styles, colors, inStock])

  // Cambio de página explícito
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    setSearchParams(params, { replace: true })
    setPage(p)
    fetchProducts(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Generar rango de páginas visibles
  const getPageRange = () => {
    const delta = 2
    const range: (number | "...")[] = []
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    range.push(1)
    if (left > 2) range.push("...")
    for (let i = left; i <= right; i++) range.push(i)
    if (right < totalPages - 1) range.push("...")
    if (totalPages > 1) range.push(totalPages)
    return range
  }

  const hasActiveFilters = categories.length > 0 || genders.length > 0 || fits.length > 0 || styles.length > 0 || colors.length > 0 || inStock || brand

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* HEADER DE BUSCADOR */}
      <div className="mb-8 border-b-4 border-black pb-6">
        <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-black md:text-5xl">
          Explorador Avanzado
        </h1>

        <div className="sticky top-16 z-30 -mx-4 flex w-full items-center gap-2 bg-[#F4F4F0]/95 px-4 py-3 backdrop-blur-sm lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="flex flex-1 items-center border-4 border-black bg-white px-4 py-2 shadow-[4px_4px_0_0_#000]">
            <FontAwesomeIcon icon={faSearch} className="text-xl text-black" />
            <input
              type="text"
              className="w-full bg-transparent px-4 py-2 font-bold text-black outline-none placeholder:text-black/40"
              placeholder="Buscar poleras, oversize, nike..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button onClick={() => setQ("")} className="text-black hover:text-red-500">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <button
            className="flex items-center justify-center gap-2 border-4 border-black bg-yellow-400 px-6 py-4 font-black uppercase text-black transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] lg:hidden"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* SIDEBAR FILTROS */}
        <aside className={`
          fixed inset-0 z-[60] bg-white p-6 lg:static lg:block lg:w-64 lg:bg-transparent lg:p-0 lg:z-auto
          ${showFiltersMobile ? "block overflow-y-auto" : "hidden"}
        `}>
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <h2 className="text-2xl font-black uppercase text-black">Filtros</h2>
            <button onClick={() => setShowFiltersMobile(false)} className="border-2 border-black p-2">
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          <div className="mb-8 space-y-6">
            {/* ORDENAR */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Ordenar por</h3>
              <select
                className="w-full border-2 border-black p-3 font-bold uppercase text-black outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="createdAt">Más Nuevos</option>
                <option value="trendingScore">Populares</option>
                <option value="price">Precio (Menor a Mayor)</option>
              </select>
            </div>

            {/* CATEGORÍAS — multiselección */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Categoría</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleItem(setCategories, cat)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${categories.includes(cat) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* GÉNERO — multiselección */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Género</h3>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleItem(setGenders, g)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${genders.includes(g) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* MARCAS */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Marca</h3>
              <div className="flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="brand"
                    checked={brand === ""}
                    onChange={() => setBrand("")}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="font-bold uppercase text-slate-800">Cualquier Marca</span>
                </label>
                {brands.map(b => (
                  <label key={b.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="brand"
                      checked={brand === b.id}
                      onChange={() => setBrand(b.id)}
                      className="h-4 w-4 accent-black"
                    />
                    <span className="font-bold uppercase text-slate-800">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* FIT */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Fit</h3>
              <div className="flex flex-wrap gap-2">
                {FITS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleItem(setFits, f)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${fits.includes(f) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* ESTILO */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Estilo</h3>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleItem(setStyles, s)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${styles.includes(s) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* COLOR */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Color</h3>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleItem(setColors, c)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${colors.includes(c) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* DISPONIBILIDAD */}
            <label className="flex cursor-pointer items-center gap-3 border-2 border-black p-3">
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => setInStock(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              <span className="font-black uppercase text-sm text-black">Solo con Stock</span>
            </label>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => { setCategories([]); setGenders([]); setFits([]); setStyles([]); setColors([]); setInStock(false); setBrand(""); }}
                className="w-full border-2 border-black py-2 text-xs font-black uppercase text-black hover:bg-red-500 hover:text-white transition-colors"
              >
                ✕ Limpiar todos los filtros
              </button>
            )}

            {showFiltersMobile && (
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="mt-4 w-full border-4 border-black bg-black py-4 font-black uppercase text-white"
              >
                Aplicar Filtros
              </button>
            )}
          </div>
        </aside>

        {/* CONTENIDO PRODUCTOS */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between bg-black px-4 py-2 text-white">
            <span className="font-bold uppercase tracking-widest">{total} Resultados</span>
            {loading && <span className="font-bold animate-pulse text-yellow-400">CARGANDO...</span>}
          </div>

          {/* Carga inicial: grilla de skeletons */}
          {loading && products.length === 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!loading && products.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center border-4 border-black bg-slate-50 text-center">
              <span className="text-4xl">😢</span>
              <h2 className="mt-4 text-xl font-black uppercase text-black">No hay resultados</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">Prueba quitando algunos filtros</p>
            </div>
          )}

          {/* Grid de productos */}
          {products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map(product => (
                <ProductCardHover
                  key={product.id}
                  product={product}
                  onClick={() => setQuickViewProduct(product)}
                />
              ))}
            </div>
          )}

          {/* PAGINACIÓN NUMÉRICA */}
          {totalPages > 1 && !loading && (
            <div className="mt-12 flex items-center justify-center gap-1">
              {/* Anterior */}
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black text-black shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página anterior"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>

              {/* Números */}
              {getPageRange().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="flex h-10 w-10 items-center justify-center font-bold text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`flex h-10 w-10 items-center justify-center border-2 border-black font-black text-sm shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]
                      ${page === p ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Siguiente */}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white font-black text-black shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Página siguiente"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          )}

          {/* Info paginación */}
          {totalPages > 1 && !loading && (
            <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
              Página {page} de {totalPages}
            </p>
          )}
        </div>
      </div>

      <ProductQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
