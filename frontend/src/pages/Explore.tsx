// src/pages/Explore.tsx
import { useEffect, useState, useCallback, useRef } from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type { Product, Brand } from "../Types/Types"
import HorizontalSection from "../components/explore/HorizontalSection"
import BrandStrip from "../components/explore/BrandStrip"
import BrandOfTheWeek from "../components/explore/BrandOfTheWeek"
import ProductQuickView from "../components/product/ProductQuickView"
import ProductMasonry from "../components/product/ProductMansory"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductCardHover from "../components/product/ProductCardHover"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBolt, faFire } from "@fortawesome/free-solid-svg-icons"

const PAGE_SIZE = 24

export default function Explore() {
  // Secciones curatoriales (cargadas una vez, ligeras)
  const [newestProducts, setNewestProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [heroBrand, setHeroBrand] = useState<Brand | null>(null)

  // Grid paginado "Todos los productos"
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const loadingRef = useRef(false)

  // quick view
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  // Carga inicial: secciones curatoriales + primera página del grid
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [newest, featured, dataBrands, gridPage] = await Promise.all([
          productsServices.getNewestProducts(15),
          productsServices.getTrendingProducts(15),
          brandsServices.getAllBrands(),
          productsServices.getProducts({ page: 1, limit: PAGE_SIZE }),
        ])

        setNewestProducts(newest)
        setFeaturedProducts(featured)
        setBrands(dataBrands)
        if (dataBrands.length > 0) {
          // Select a random brand for the week spotlight
          const randomIdx = Math.floor(Math.random() * dataBrands.length)
          setHeroBrand(dataBrands[randomIdx])
        }

        setProducts(gridPage.data)
        setTotal(gridPage.total)
        setHasMore(gridPage.hasMore)

        console.log("newest", newest)
        console.log("featured", featured)
        console.log("brands", dataBrands)
        console.log("gridPage", gridPage)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Cargar más páginas del grid
  const fetchPage = useCallback(async (pageNum: number) => {
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      const result = await productsServices.getProducts({ page: pageNum, limit: PAGE_SIZE })
      setProducts((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
    } finally {
      loadingRef.current = false
    }
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingRef.current) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPage(nextPage)
    }
  }, [hasMore, page, fetchPage])

  useInfiniteScroll(loadMore)

  return (
    <>
    <section className="mx-auto max-w-7xl px-4">
      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando productos…</p>
        ) : (
          <div className="rounded-lg px-4">
            {/* SECCIONES CURATORIALES */}
            <BrandStrip brands={brands} />

            {heroBrand && (
               <BrandOfTheWeek 
                 brand={heroBrand} 
                 onProductClick={(product) => setQuickViewProduct(product)} 
               />
            )}

            <HorizontalSection
              title={
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-500" />
                  <span>Nuevos</span>
                </div>
              }
              products={newestProducts}
              onProductClick={(product) => setQuickViewProduct(product)}
              viewMoreLink="/search?sort=createdAt"
            />

            <HorizontalSection
              title={
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFire} className="text-orange-500" />
                  <span>Destacados</span>
                </div>
              }
              products={featuredProducts}
              onProductClick={(product) => setQuickViewProduct(product)}
              viewMoreLink="/search?sort=trendingScore"
            />
          </div>
        )}
      </div>

      <ProductQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* GRID INFINITO */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black">
            Todos los productos
          </h2>
          <span className="font-bold tracking-widest text-slate-500 text-sm">
            {total} resultados
          </span>
        </div>

        {products.length === 0 && !loading ? (
          <div className="rounded-sm border-2 border-black bg-white p-8 text-center shadow-[4px_4px_0_0_#000]">
            <p className="font-bold uppercase tracking-widest text-slate-600">
              No encontramos productos con estos filtros.
            </p>
          </div>
        ) : (
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
          <p className="mt-6 text-center text-sm text-slate-500">
            Cargando más productos…
          </p>
        )}

        {!hasMore && products.length > 0 && (
          <p className="mt-6 text-center text-sm text-slate-400">
            Has visto todos los productos 🎉
          </p>
        )}
      </section>
    </section>
    </>
  )
}
