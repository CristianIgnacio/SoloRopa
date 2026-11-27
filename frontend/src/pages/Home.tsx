import { useEffect, useState, useCallback, useRef } from "react"
import productsServices from "../services/products"
import type { Product } from "../Types/Types"
import ProductMasonry, { ProductMasonrySkeleton } from "../components/product/ProductMansory"
// import { productsMock } from "../mocks/products.mocks"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductQuickView from "../components/product/ProductQuickView"
// import ProductCardDots from "../components/product/ProductCardDots"
import ProductCardHover from "../components/product/ProductCardHover"
// import ProductCard from "../components/product/ProductCard"

const PAGE_SIZE = 20

// Home ocupa todo el ancho: más columnas en pantallas grandes para que las cards no crezcan demasiado
const HOME_COLUMNS = { default: 6, 1920: 6, 1536: 5, 1280: 4, 1024: 3, 768: 2 }

// Orden aleatorio: una semilla por visita al Home. El backend la usa para barajar
// siempre igual, así las páginas del scroll infinito no repiten ni saltan productos.
const newSeed = () => Math.floor(Math.random() * 2 ** 31)

const Home = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
    const [seed] = useState(newSeed)

    // Evitar peticiones duplicadas simultáneas
    const loadingRef = useRef(false)

    // Función para cargar una página
    const fetchPage = useCallback(async (pageNum: number) => {
        if (loadingRef.current) return
        loadingRef.current = true
        setLoading(true)

        try {
            const result = await productsServices.getProducts({ page: pageNum, limit: PAGE_SIZE, sort: "random", seed })

            setProducts((prev) =>
                pageNum === 1 ? result.data : [...prev, ...result.data]
            )
            setHasMore(result.hasMore)
        } finally {
            setLoading(false)
            loadingRef.current = false
        }
    }, [seed])

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
        <section className="w-full px-3 py-6 md:px-6">
            {/* Carga Inicial */}
            {loading && products.length === 0 && (
                <ProductMasonrySkeleton count={18} mobileColumns={2} breakpointCols={HOME_COLUMNS} variant="clean" />
            )}

            {/* Grid Principal */}
            {products.length > 0 && (
                <ProductMasonry
                    products={products}
                    imageMode="natural"
                    mobileColumns={2}
                    breakpointCols={HOME_COLUMNS}
                    renderItem={(product, imageMode) => (
                        <ProductCardHover key={product.id} product={product} imageMode={imageMode} variant="clean" onClick={() => setQuickViewProduct(product)}/>
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
