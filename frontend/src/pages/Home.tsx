import { useEffect, useState, useCallback, useRef } from "react"
import productsServices from "../services/products"
import type { Product } from "../Types/Types"
import ProductMasonry from "../components/product/ProductMansory"
// import { productsMock } from "../mocks/products.mocks"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductQuickView from "../components/product/ProductQuickView"
// import ProductCardDots from "../components/product/ProductCardDots"
import ProductCardHover from "../components/product/ProductCardHover"
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
            const result = await productsServices.getProducts(pageNum, PAGE_SIZE)

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
            <ProductMasonry
                products={products}
                renderItem={(product) => (
                    <>
                    {/* <ProductCard key={product.id} product={product} /> */}
                    <ProductCardHover key={product.id} product={product} onClick={() => setQuickViewProduct(product)}/>
                    {/* <ProductCardDots product={product} onClick={() => setQuickViewProduct(product)}/> */}
                    </>
                )}
            />

            {loading && (
                <p className="mt-6 text-center text-sm text-slate-500">
                    Cargando más productos...
                </p>
            )}

            {!hasMore && products.length > 0 && (
                <p className="mt-6 text-center text-sm text-slate-400">
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