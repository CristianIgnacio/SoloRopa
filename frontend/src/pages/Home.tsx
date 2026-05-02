import { useEffect, useState, useCallback, useRef } from "react"
import productsServices from "../services/products"
import type { Product } from "../Types/Types"
import ProductMasonry from "../components/product/ProductMansory"
// import { productsMock } from "../mocks/products.mocks"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductQuickView from "../components/product/ProductQuickView"
// import ProductCardDots from "../components/product/ProductCardDots"
import ProductCardHover from "../components/product/ProductCardHover"
import ProductCardSkeleton from "../components/product/ProductCardSkeleton"
// import ProductCard from "../components/product/ProductCard"

const PAGE_SIZE = 20

const Home = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

    // Evitar peticiones duplicadas simultáneas
    const loadingRef = useRef(false)

    // Función para cargar una página
    const fetchPage = useCallback(async (pageNum: number) => {
        if (loadingRef.current) return
        loadingRef.current = true
        setLoading(true)

        try {
            const result = await productsServices.getProducts({ page: pageNum, limit: PAGE_SIZE })

            setProducts((prev) =>
                pageNum === 1 ? result.data : [...prev, ...result.data]
            )
            setHasMore(result.hasMore)
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, [])

    // Carga inicial
    useEffect(() => {
        fetchPage(1)
    }, [fetchPage])

    // Cargar más al hacer scroll
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
        <section className="mx-auto max-w-7xl px-4 py-6">
            {/* Carga Inicial */}
            {loading && products.length === 0 && (
                <div className="columns-2 gap-4 sm:columns-3 md:columns-4 lg:columns-5 space-y-4">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid">
                            <ProductCardSkeleton />
                        </div>
                    ))}
                </div>
            )}

            {/* Grid Principal */}
            {products.length > 0 && (
                <ProductMasonry
                    products={products}
                    imageMode="natural"
                    renderItem={(product, imageMode) => (
                        <ProductCardHover key={product.id} product={product} imageMode={imageMode} onClick={() => setQuickViewProduct(product)}/>
                    )}
                />
            )}

            {/* Scroll Infinito Carga */}
            {loading && products.length > 0 && (
                <p className="mt-8 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-black">
                    Cargando drop...
                </p>
            )}

            {!hasMore && products.length > 0 && (
                <p className="mt-8 border-t-2 border-black pt-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                    Has visto todos los productos 🎉
                </p>
            )}
        </section>

        <ProductQuickView
            product={quickViewProduct}
            open={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
        />
        </>
    )
}

export default Home