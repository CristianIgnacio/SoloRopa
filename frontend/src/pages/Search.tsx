import { useEffect, useState, useCallback, useRef } from "react"
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
const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Única"]
const NUMBER_SIZES = ["4", "6", "8", "10", "16", "18", "20", "22", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "54", "56", "58", "60"]
const PRICE_SLIDER_STEPS = 1000
const DEFAULT_MAX_PRICE = 200000

const sliderToPrice = (position: number, maxPrice: number) =>
  Math.round(maxPrice * Math.pow(position / PRICE_SLIDER_STEPS, 2.5) / 1000) * 1000

const priceToSlider = (price: number, maxPrice: number) =>
  Math.round(Math.pow(Math.min(Math.max(price, 0), maxPrice) / maxPrice, 1 / 2.5) * PRICE_SLIDER_STEPS)

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filtros del estado local (sincronizados con la URL)
  const initialQ          = searchParams.get("q") || ""
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) || []
  const initialGenders    = searchParams.get("gender")?.split(",").filter(Boolean) || []
  const initialBrands     = searchParams.get("brand")?.split(",").filter(Boolean) || []
  const sortParam         = searchParams.get("sort")
  const initialSort       = sortParam === "price"
    ? searchParams.get("order") === "desc" ? "price-desc" : "price-asc"
    : sortParam || "createdAt"
  const initialFit        = searchParams.get("fit")?.split(",").filter(Boolean) || []
  const initialStyle      = searchParams.get("style")?.split(",").filter(Boolean) || []
  const initialColor      = searchParams.get("color")?.split(",").filter(Boolean) || []
  const initialSizes      = searchParams.get("size")?.split(",").filter(Boolean) || []
  const initialMinPrice   = searchParams.get("minPrice") || ""
  const initialMaxPrice   = searchParams.get("maxPrice") || ""
  const initialOnSale     = searchParams.get("onSale") === "true"
  const initialInStock    = searchParams.get("inStock") === "true"
  const initialPage       = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)

  const [q, setQ]                   = useState(initialQ)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [genders, setGenders]       = useState<string[]>(initialGenders)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands)
  const [sort, setSort]             = useState(initialSort)
  const [fits, setFits]             = useState<string[]>(initialFit)
  const [styles, setStyles]         = useState<string[]>(initialStyle)
  const [colors, setColors]         = useState<string[]>(initialColor)
  const [sizes, setSizes]           = useState<string[]>(initialSizes)
  const [showNumericSizes, setShowNumericSizes] = useState(initialSizes.some((size) => NUMBER_SIZES.includes(size)))
  const [minPrice, setMinPrice]     = useState(initialMinPrice)
  const [maxPrice, setMaxPrice]     = useState(initialMaxPrice)
  const [catalogMaxPrice, setCatalogMaxPrice] = useState(DEFAULT_MAX_PRICE)
  const [sliderDraft, setSliderDraft] = useState<{ min: number; max: number } | null>(null)
  const [onSale, setOnSale]         = useState(initialOnSale)
  const [inStock, setInStock]       = useState(initialInStock)
  const [page, setPage]             = useState(initialPage)

  // Datos
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands]     = useState<Brand[]>([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]   = useState(false)
  const latestRequest = useRef(0)
  const appliedFilterQuery = useRef<string | null>(null)

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

  useEffect(() => {
    let active = true
    productsServices.getProducts({ page: 1, limit: 1, sort: "price", order: "desc", minPrice: 0 })
      .then((result) => {
        const highestPrice = Number(result.data[0]?.price)
        if (active && Number.isFinite(highestPrice) && highestPrice > 0) {
          setCatalogMaxPrice(Math.ceil(highestPrice / 1000) * 1000)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const sliderMaxPrice = Math.max(catalogMaxPrice, Number(minPrice) || 0, Number(maxPrice) || 0)
  const appliedMinPosition = minPrice ? priceToSlider(Number(minPrice), sliderMaxPrice) : 0
  const appliedMaxPosition = maxPrice ? priceToSlider(Number(maxPrice), sliderMaxPrice) : PRICE_SLIDER_STEPS
  const sliderMinPosition = sliderDraft?.min ?? appliedMinPosition
  const sliderMaxPosition = sliderDraft?.max ?? Math.max(appliedMinPosition, appliedMaxPosition)

  const commitSliderPrice = (thumb: "min" | "max", position: number) => {
    const boundedPosition = thumb === "min"
      ? Math.min(position, sliderMaxPosition)
      : Math.max(position, sliderMinPosition)
    const price = sliderToPrice(boundedPosition, sliderMaxPrice)
    if (thumb === "min") setMinPrice(price === 0 ? "" : String(price))
    else setMaxPrice(boundedPosition === PRICE_SLIDER_STEPS ? "" : String(price))
    setSliderDraft(null)
  }

  const moveSliderThumb = (thumb: "min" | "max", position: number) => {
    setSliderDraft({
      min: thumb === "min" ? Math.min(position, sliderMaxPosition) : sliderMinPosition,
      max: thumb === "max" ? Math.max(position, sliderMinPosition) : sliderMaxPosition,
    })
  }

  const formatPrice = (price: number) => `$${price.toLocaleString("es-CL")}`

  // Buscar productos
  const fetchProducts = useCallback(async (pageNum: number) => {
    const requestId = ++latestRequest.current
    setLoading(true)
    try {
      const params: Record<string, string | number | undefined> = {
        page: pageNum,
        limit: PAGE_SIZE,
        q: q || undefined,
        category: categories.length ? categories.join(",") : undefined,
        gender: genders.length ? genders.join(",") : undefined,
        brand: selectedBrands.length ? selectedBrands.join(",") : undefined,
        sort: sort.startsWith("price-") ? "price" : sort,
        order: sort === "price-asc" ? "asc" : "desc",
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        size: sizes.length ? sizes.join(",") : undefined,
        onSale: onSale ? "true" : undefined,
        fit:   fits.length   ? fits.join(",")   : undefined,
        style: styles.length ? styles.join(",") : undefined,
        color: colors.length ? colors.join(",") : undefined,
        inStock: inStock ? "true" : undefined,
      }

      const res = await productsServices.getProducts(params)

      if (requestId !== latestRequest.current) return
      setProducts(res.data)
      setTotal(res.total)
      setTotalPages(res.pages ?? Math.ceil(res.total / PAGE_SIZE))
    } finally {
      if (requestId === latestRequest.current) setLoading(false)
    }
  }, [q, categories, genders, selectedBrands, sort, fits, styles, colors, sizes, minPrice, maxPrice, onSale, inStock])

  // Reiniciar la página solo cuando cambian los filtros, conservando la página inicial de la URL.
  useEffect(() => {
    const params = new URLSearchParams()
    if (q)                       params.set("q", q)
    if (categories.length)       params.set("category", categories.join(","))
    if (genders.length)          params.set("gender", genders.join(","))
    if (selectedBrands.length)   params.set("brand", selectedBrands.join(","))
    if (sort !== "createdAt")    params.set("sort", sort.startsWith("price-") ? "price" : sort)
    if (sort.startsWith("price-")) params.set("order", sort === "price-asc" ? "asc" : "desc")
    if (fits.length)             params.set("fit",   fits.join(","))
    if (styles.length)           params.set("style", styles.join(","))
    if (colors.length)           params.set("color", colors.join(","))
    if (sizes.length)            params.set("size", sizes.join(","))
    if (minPrice)                params.set("minPrice", minPrice)
    if (maxPrice)                params.set("maxPrice", maxPrice)
    if (onSale)                  params.set("onSale", "true")
    if (inStock)                 params.set("inStock", "true")
    const filterQuery = params.toString()
    if (appliedFilterQuery.current === filterQuery) return

    const nextPage = appliedFilterQuery.current === null ? page : 1
    appliedFilterQuery.current = filterQuery
    params.set("page", String(nextPage))

    setSearchParams(params, { replace: true })
    setPage(nextPage)
    fetchProducts(nextPage)
  }, [q, categories, genders, selectedBrands, sort, fits, styles, colors, sizes, minPrice, maxPrice, onSale, inStock, page, fetchProducts, setSearchParams])

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

  const hasActiveFilters = categories.length > 0 || genders.length > 0 || fits.length > 0 || styles.length > 0 || colors.length > 0 || sizes.length > 0 || selectedBrands.length > 0 || minPrice !== "" || maxPrice !== "" || onSale || inStock

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
                <option value="price-asc">Precio (Menor a Mayor)</option>
                <option value="price-desc">Precio (Mayor a Menor)</option>
              </select>
            </div>

            {/* PRECIO */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Precio (CLP)</h3>
              <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-black">
                <span>{sliderDraft ? formatPrice(sliderToPrice(sliderMinPosition, sliderMaxPrice)) : formatPrice(Number(minPrice) || 0)}</span>
                <span>{sliderDraft
                  ? sliderMaxPosition === PRICE_SLIDER_STEPS ? "Sin límite" : formatPrice(sliderToPrice(sliderMaxPosition, sliderMaxPrice))
                  : maxPrice ? formatPrice(Number(maxPrice)) : "Sin límite"}</span>
              </div>
              <div className="relative mb-3 h-7" role="group" aria-label="Rango de precios">
                <div
                  className="absolute inset-x-[10px] top-[11px] h-1.5 cursor-pointer bg-slate-300"
                  onPointerDown={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect()
                    const position = Math.round(Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1) * PRICE_SLIDER_STEPS)
                    const thumb = sliderMinPosition === sliderMaxPosition
                      ? position < sliderMinPosition ? "min" : "max"
                      : Math.abs(position - sliderMinPosition) <= Math.abs(position - sliderMaxPosition) ? "min" : "max"
                    commitSliderPrice(thumb, position)
                  }}
                />
                <div
                  className="pointer-events-none absolute top-[11px] h-1.5 bg-yellow-400"
                  style={{
                    left: `calc(10px + (100% - 20px) * ${sliderMinPosition / PRICE_SLIDER_STEPS})`,
                    right: `calc(10px + (100% - 20px) * ${(PRICE_SLIDER_STEPS - sliderMaxPosition) / PRICE_SLIDER_STEPS})`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={PRICE_SLIDER_STEPS}
                  step="1"
                  value={sliderMinPosition}
                  onChange={(event) => moveSliderThumb("min", Number(event.target.value))}
                  onPointerUp={(event) => commitSliderPrice("min", Number(event.currentTarget.value))}
                  onKeyUp={(event) => commitSliderPrice("min", Number(event.currentTarget.value))}
                  onBlur={(event) => { if (sliderDraft) commitSliderPrice("min", Number(event.currentTarget.value)) }}
                  className="price-range-input z-10"
                  aria-label="Precio mínimo"
                  aria-valuetext={formatPrice(sliderDraft ? sliderToPrice(sliderMinPosition, sliderMaxPrice) : Number(minPrice) || 0)}
                />
                <input
                  type="range"
                  min="0"
                  max={PRICE_SLIDER_STEPS}
                  step="1"
                  value={sliderMaxPosition}
                  onChange={(event) => moveSliderThumb("max", Number(event.target.value))}
                  onPointerUp={(event) => commitSliderPrice("max", Number(event.currentTarget.value))}
                  onKeyUp={(event) => commitSliderPrice("max", Number(event.currentTarget.value))}
                  onBlur={(event) => { if (sliderDraft) commitSliderPrice("max", Number(event.currentTarget.value)) }}
                  className="price-range-input z-20"
                  aria-label="Precio máximo"
                  aria-valuetext={sliderMaxPosition === PRICE_SLIDER_STEPS ? "Sin límite" : formatPrice(sliderDraft ? sliderToPrice(sliderMaxPosition, sliderMaxPrice) : Number(maxPrice))}
                />
              </div>
              <div className="mb-3 flex justify-between text-[10px] font-bold text-slate-500">
                <span>$0</span>
                <span>{formatPrice(sliderMaxPrice)}</span>
              </div>
              <div className="flex gap-2">
                <label className="min-w-0 flex-1 text-xs font-bold text-slate-700">
                  Desde
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="mt-1 w-full min-w-0 border-2 border-black bg-white px-2 py-2 text-sm text-black"
                    placeholder="0"
                  />
                </label>
                <label className="min-w-0 flex-1 text-xs font-bold text-slate-700">
                  Hasta
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="mt-1 w-full min-w-0 border-2 border-black bg-white px-2 py-2 text-sm text-black"
                    placeholder="Sin límite"
                  />
                </label>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 border-2 border-black p-3">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
                className="h-4 w-4 accent-black"
              />
              <span className="text-sm font-black uppercase text-black">En oferta</span>
            </label>

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

            {/* TALLAS DISPONIBLES */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Talla disponible</h3>
              <div className="flex flex-wrap gap-2">
                {LETTER_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleItem(setSizes, size)}
                    aria-pressed={sizes.includes(size)}
                    className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                      ${sizes.includes(size) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-expanded={showNumericSizes}
                onClick={() => setShowNumericSizes((open) => !open)}
                className="mt-3 text-xs font-bold uppercase text-slate-700 underline underline-offset-2"
              >
                Tallas numéricas {showNumericSizes ? "−" : "+"}
              </button>
              {showNumericSizes && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {NUMBER_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleItem(setSizes, size)}
                      aria-pressed={sizes.includes(size)}
                      className={`border-2 border-black px-3 py-1 text-xs font-black uppercase transition-colors
                        ${sizes.includes(size) ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MARCAS */}
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-black">Marca</h3>
              <div className="flex flex-col gap-2">
                {brands.map(b => (
                  <label key={b.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.id)}
                      onChange={() => toggleItem(setSelectedBrands, b.id)}
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
                onClick={() => { setCategories([]); setGenders([]); setFits([]); setStyles([]); setColors([]); setSizes([]); setSelectedBrands([]); setMinPrice(""); setMaxPrice(""); setOnSale(false); setInStock(false); }}
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
