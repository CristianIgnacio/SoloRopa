// src/pages/Explore.tsx
import { useEffect, useState, useCallback, useRef } from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type { Product, Brand } from "../Types/Types"
import HorizontalSection from "../components/explore/HorizontalSection"
import ExploreHero from "../components/explore/ExploreHero"
import CategoryTiles from "../components/explore/CategoryTiles"
import StyleShowcase from "../components/explore/StyleShowcase"
// import TrendCollections from "../components/explore/TrendCollections" // oculta por ahora
import BrandGrid from "../components/explore/BrandGrid"
import LookBanners from "../components/explore/LookBanners"
import GridFilters from "../components/explore/GridFilters"
import { SORT_OPTIONS, type GridFilterState } from "../components/explore/gridFilterOptions"
import BrandOfTheWeek from "../components/explore/BrandOfTheWeek"
import ProductQuickView from "../components/product/ProductQuickView"
import ProductMasonry from "../components/product/ProductMansory"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductCardHover from "../components/product/ProductCardHover"
import ProductCardSkeleton from "../components/product/ProductCardSkeleton"
import Footer from "../components/layout/Footer"

const PAGE_SIZE = 24
/** Páginas que se cargan solas con el scroll; después aparece el botón "Cargar más" para llegar al footer */
const AUTO_PAGES = 3

const INITIAL_FILTERS: GridFilterState = { gender: "", category: "", sort: "newest" }

const toParams = (f: GridFilterState) => {
  const sort = SORT_OPTIONS.find((o) => o.key === f.sort) ?? SORT_OPTIONS[0]
  return {
    limit: PAGE_SIZE,
    inStock: true,
    sort: sort.sort,
    order: sort.order,
    gender: f.gender || undefined,
    category: f.category || undefined,
  }
}

export default function Explore() {
  // Secciones curatoriales (cargadas una vez, ligeras)
  const [newestProducts, setNewestProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // Grid paginado "Todos los productos"
  const [filters, setFilters] = useState<GridFilterState>(INITIAL_FILTERS)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [gridLoading, setGridLoading] = useState(true)
  const loadingRef = useRef(false)
  const requestId = useRef(0)
  const gridRef = useRef<HTMLElement>(null)

  // quick view
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const openQuickView = (product: Product) => setQuickViewProduct(product)

  // Carga inicial de las secciones curatoriales
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [newest, featured, dataBrands, sale] = await Promise.all([
          productsServices.getNewestProducts(15),
          productsServices.getTrendingProducts(15),
          brandsServices.getAllBrands(),
          productsServices
            .getProducts({ page: 1, limit: 15, onSale: true, inStock: true, sort: "trendingScore", order: "desc" })
            .then((r) => r.data)
            .catch(() => []),
        ])

        setNewestProducts(newest)
        setFeaturedProducts(featured)
        setSaleProducts(sale)
        setBrands(dataBrands)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Primera página del grid (y cada vez que cambian los filtros)
  useEffect(() => {
    const id = ++requestId.current
    setGridLoading(true)
    setProducts([])
    setPage(1)
    setHasMore(true)

    productsServices
      .getProducts({ page: 1, ...toParams(filters) })
      .then((result) => {
        if (id !== requestId.current) return
        setProducts(result.data)
        setTotal(result.total)
        setHasMore(result.hasMore)
      })
      .finally(() => {
        if (id === requestId.current) setGridLoading(false)
      })
  }, [filters])

  // Cargar más páginas del grid
  const fetchPage = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    const id = requestId.current

    try {
      const result = await productsServices.getProducts({ page: pageNum, ...toParams(filters) })
      if (id !== requestId.current) return
      setProducts((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(pageNum)
    } finally {
      loadingRef.current = false
    }
  }, [filters])

  const loadMore = useCallback(() => {
    if (hasMore && !gridLoading && !loadingRef.current) fetchPage(page + 1)
  }, [hasMore, gridLoading, page, fetchPage])

  // Scroll infinito solo para las primeras páginas
  const autoLoad = useCallback(() => {
    if (page < AUTO_PAGES) loadMore()
  }, [page, loadMore])

  useInfiniteScroll(autoLoad)

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const changeFilters = (next: GridFilterState) => {
    setFilters(next)
    scrollToGrid()
  }

  return (
    <>
    {/* HERO a todo el ancho */}
    <ExploreHero onCtaClick={scrollToGrid} />

    <section className="mx-auto max-w-7xl px-4">
      {/* CATEGORÍAS */}
      <CategoryTiles />

      {/* ESTILOS */}
      <StyleShowcase />

      <div>
        {loading ? (
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* NUEVAS LLEGADAS */}
            <HorizontalSection
              title="Nuevas llegadas"
              products={newestProducts}
              onProductClick={openQuickView}
              viewMoreLink="/search?sort=createdAt"
            />

            {/* COLECCIONES POR TENDENCIA — oculta por ahora */}
            {/* <TrendCollections /> */}

            {/* MARCA DE LA SEMANA */}
            {/* Cambia cada lunes según la rotación de marcas (utils/brandOfTheWeek) */}
            <BrandOfTheWeek brands={brands} onProductClick={openQuickView} />

            {/* EN OFERTA */}
            <HorizontalSection
              title="En oferta"
              products={saleProducts}
              onProductClick={openQuickView}
              viewMoreLink="/search?onSale=true"
            />

            {/* LOOKS */}
            <LookBanners />

            {/* DESTACADOS */}
            <HorizontalSection
              title="Destacados"
              products={featuredProducts}
              onProductClick={openQuickView}
              viewMoreLink="/search?sort=trendingScore"
            />

            {/* MARCAS */}
            <BrandGrid brands={brands} />
          </>
        )}
      </div>

      <ProductQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* GRID "TODOS LOS PRODUCTOS" */}
      <section ref={gridRef} className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-black uppercase leading-none tracking-tighter text-black sm:text-3xl md:text-4xl">
          Todos los productos
        </h2>

        {/* Filtros rápidos (fijos al hacer scroll) */}
        <GridFilters value={filters} onChange={changeFilters} />

        {gridLoading && (
          <div className="columns-2 gap-3 md:columns-3 xl:columns-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {!gridLoading && products.length === 0 ? (
          <div className="bg-[#F0F0F0] p-10 text-center">
            <p className="font-bold uppercase tracking-widest text-slate-600">
              No encontramos productos con estos filtros.
            </p>
            <button
              onClick={() => changeFilters(INITIAL_FILTERS)}
              className="mt-4 bg-black px-5 py-2 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-400 hover:text-black"
            >
              Quitar filtros
            </button>
          </div>
        ) : (
          products.length > 0 && (
            <ProductMasonry
              products={products}
              imageMode="natural"
              mobileColumns={2}
              renderItem={(product, imageMode) => (
                <ProductCardHover
                  key={product.id}
                  product={product}
                  imageMode={imageMode}
                  variant="clean"
                  onClick={() => openQuickView(product)}
                />
              )}
            />
          )
        )}

        {!gridLoading && hasMore && page < AUTO_PAGES && (
          <p className="mt-6 text-center text-sm text-slate-500">Cargando más productos…</p>
        )}

        {!gridLoading && hasMore && page >= AUTO_PAGES && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              onClick={loadMore}
              className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-400 hover:text-black"
            >
              Cargar más productos
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Viendo {products.length.toLocaleString("es-CL")} de {total.toLocaleString("es-CL")}
            </span>
          </div>
        )}

        {!gridLoading && !hasMore && products.length > 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">Has visto todos los productos 🎉</p>
        )}
      </section>
    </section>

    <Footer />
    </>
  )
}
