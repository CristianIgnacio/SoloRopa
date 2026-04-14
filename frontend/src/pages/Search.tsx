import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type { Product, Brand } from "../Types/Types"
import ProductMasonry from "../components/product/ProductMansory"
import ProductCardHover from "../components/product/ProductCardHover"
import ProductCardSkeleton from "../components/product/ProductCardSkeleton"
import ProductQuickView from "../components/product/ProductQuickView"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons"

const PAGE_SIZE = 24

const FITS    = ["oversize", "boxy", "slim", "baggy", "relaxed", "cropped", "regular"]
const STYLES  = ["streetwear", "dark", "vintage", "skate", "y2k", "urbano", "minimal", "workwear", "goth", "outdoor"]
const COLORS  = ["negro", "blanco", "gris", "azul", "rojo", "verde", "cafe", "beige", "naranja", "morado", "rosado", "stone"]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filtros del estado local (sincronizados con la URL)
  const initialQ        = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || ""
  const initialGender   = searchParams.get("gender") || ""
  const initialBrand    = searchParams.get("brand") || ""
  const initialSort     = searchParams.get("sort") || "createdAt"
  const initialFit      = searchParams.get("fit")?.split(",").filter(Boolean) || []
  const initialStyle    = searchParams.get("style")?.split(",").filter(Boolean) || []
  const initialColor    = searchParams.get("color")?.split(",").filter(Boolean) || []
  const initialInStock  = searchParams.get("inStock") === "true"

  const [q, setQ]             = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)
  const [gender, setGender]   = useState(initialGender)
  const [brand, setBrand]     = useState(initialBrand)
  const [sort, setSort]       = useState(initialSort)
  const [fits, setFits]       = useState<string[]>(initialFit)
  const [styles, setStyles]   = useState<string[]>(initialStyle)
  const [colors, setColors]   = useState<string[]>(initialColor)
  const [inStock, setInStock] = useState(initialInStock)

  // Datos
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands]     = useState<Brand[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(true)
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

  // Buscar productos cuando cambia cualquier filtro o página
  const fetchProducts = useCallback(async (pageNum: number, isNewSearch = false) => {
    setLoading(true)
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: PAGE_SIZE,
        q: q || undefined,
        category: category || undefined,
        gender: gender || undefined,
        brand: brand || undefined,
        sort: sort || undefined,
        fit:   fits.length   ? fits.join(",")   : undefined,
        style: styles.length ? styles.join(",") : undefined,
        color: colors.length ? colors.join(",") : undefined,
        inStock: inStock ? "true" : undefined,
      }

      const res = await productsServices.getProducts(params)

      setProducts(prev => isNewSearch ? res.data : [...prev, ...res.data])
      setTotal(res.total)
      setHasMore(res.hasMore)
      setPage(pageNum)
    } finally {
      setLoading(false)
    }
  }, [q, category, gender, brand, sort, fits, styles, colors, inStock])

  // Efecto que aplica la búsqueda al cambiar parámetros (desde state -> url)
  useEffect(() => {
    const params = new URLSearchParams()
    if (q)                   params.set("q", q)
    if (category)            params.set("category", category)
    if (gender)              params.set("gender", gender)
    if (brand)               params.set("brand", brand)
    if (sort !== "createdAt") params.set("sort", sort)
    if (fits.length)         params.set("fit",   fits.join(","))
    if (styles.length)       params.set("style", styles.join(","))
    if (colors.length)       params.set("color", colors.join(","))
    if (inStock)             params.set("inStock", "true")
    
    setSearchParams(params, { replace: true })
    fetchProducts(1, true)
  }, [q, category, gender, brand, sort, fits, styles, colors, inStock])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* HEADER DE BUSCADOR */}
      <div className="mb-8 border-b-4 border-black pb-6">
        <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-black md:text-5xl">
          Explorador Avanzado
        </h1>
        
        <div className="flex w-full items-center gap-2">
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
          fixed inset-0 z-40 bg-white p-6 lg:static lg:block lg:w-64 lg:bg-transparent lg:p-0
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

            {/* CATEGORÍAS */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Categoría</h3>
              <div className="flex flex-col gap-2">
                {["", "poleras", "polerones", "pantalones", "shorts", "chaquetas", "zapatillas", "accesorios", "otros"].map(cat => (
                  <label key={cat} className="flex cursor-pointer items-center gap-3">
                    <input 
                      type="radio" 
                      name="category"
                      checked={category === cat}
                      onChange={() => setCategory(cat)}
                      className="h-4 w-4 accent-black" 
                    />
                    <span className="font-bold uppercase text-slate-800">{cat || "Todas"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* GÉNERO */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Género</h3>
              <div className="flex flex-col gap-2">
                {["", "hombre", "mujer", "unisex"].map(g => (
                  <label key={g} className="flex cursor-pointer items-center gap-3">
                    <input 
                      type="radio" 
                      name="gender"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="h-4 w-4 accent-black" 
                    />
                    <span className="font-bold uppercase text-slate-800">{g || "Todos"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* MARCAS */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Marcas</h3>
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
            {(fits.length > 0 || styles.length > 0 || colors.length > 0 || inStock || category || gender || brand) && (
              <button
                type="button"
                onClick={() => { setFits([]); setStyles([]); setColors([]); setInStock(false); setCategory(""); setGender(""); setBrand(""); }}
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
            <ProductMasonry
              products={products}
              renderItem={(product) => (
                <ProductCardHover
                  key={product.id}
                  product={product}
                  onClick={() => setQuickViewProduct(product)}
                />
              )}
            />
          )}

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={loading}
                className="group relative inline-block overflow-hidden border-4 border-black bg-white px-8 py-4 font-black uppercase text-black shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-none disabled:opacity-50"
              >
                <div className="absolute inset-0 -translate-x-full bg-yellow-400 transition-transform duration-300 ease-out group-hover:translate-x-0"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? "Cargando..." : "Cargar Más Resultados"}
                </span>
              </button>
            </div>
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
