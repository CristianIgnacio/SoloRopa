// src/pages/Explore.tsx
import { useEffect, useMemo, useState, useCallback } from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type { Product, Brand } from "../Types/Types"
import HorizontalSection from "../components/explore/HorizontalSection"
import BrandStrip from "../components/explore/BrandStrip"
import ProductQuickView from "../components/product/ProductQuickView"
import ProductMasonry from "../components/product/ProductMansory"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductCardHover from "../components/product/ProductCardHover"

const PAGE_SIZE = 24

export default function Explore() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  // quick view product
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  
  // pages
  const [page, setPage] = useState(1)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const [dataProducts, dataBrands] = await Promise.all([
          productsServices.getAllProducts(),
          brandsServices.getAllBrands(),
        ])
        setProducts(dataProducts)
        setBrands(dataBrands)
        console.log("Brands",dataBrands)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // 🆕 Nuevos (asumimos createdAt)
  const newestProducts = [...products]
      .sort((a, b) => {
          const da = new Date(a.createdAt ?? 0).getTime()
          const db = new Date(b.createdAt ?? 0).getTime()
          return db - da
      })
      .slice(0, 15)

  // 🔥 Destacados (fallback: orden original o random)
  const featuredProducts = [...products].slice(0, 15)

  const visibleProducts = useMemo(() => {
    return products.slice(0, page * PAGE_SIZE)
  }, [products, page])


  const loadMore = useCallback(() => {
    if (visibleProducts.length < products.length) {
      setPage((prev) => prev + 1)
    }
  }, [visibleProducts.length, products.length])

  useInfiniteScroll(loadMore)

  return (
    <>
    <section className="mx-auto max-w-7xl px-4">
      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando productos…</p>
        )  : (
          <div className="rounded-lg px-4">
            {/* SECCIONES CURATORIALES */}
            <BrandStrip
                brands={brands}
                // activeBrandId={brandId === "all" ? undefined : brandId}
            />

            <HorizontalSection
                title="🆕 Nuevos"
                products={newestProducts}
                onProductClick={(product) => setQuickViewProduct(product)}
            />
    
            <HorizontalSection
                title="🔥 Destacados"
                products={featuredProducts}
                onProductClick={(product) => setQuickViewProduct(product)}
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Todos los productos
          </h2>
          <span className="text-sm text-slate-500">
            {products.length} resultados
          </span>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              No encontramos productos con estos filtros.
            </p>
          </div>
        ) : (
          <ProductMasonry 
            products={visibleProducts}
            renderItem={(product) => (
                <ProductCardHover key={product.id} product={product} onClick={() => setQuickViewProduct(product)}/>
            )} />
        )}

        {visibleProducts.length < products.length && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Cargando más productos…
          </p>
        )}
      </section>
    </section>

    </>
  )
}
