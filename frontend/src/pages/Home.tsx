import { useEffect, useState, useCallback} from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type {Product} from "../Types/Types"
import ProductMasonry from "../components/product/ProductMansory"
import { productsMock } from "../mocks/products.mocks"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"
import ProductQuickView from "../components/product/ProductQuickView"
// import ProductCardDots from "../components/product/ProductCardDots"
import ProductCardHover from "../components/product/ProductCardHover"
// import ProductCard from "../components/product/ProductCard"

const PAGE_SIZE = 20

const Home = () => {
    const [products, setProducts] = useState<Product[]>([])
    // const [brands, setBrands] = useState<Brand[] | []>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

    useEffect(() => {
        const init = async () => {
            setLoading(true)

            const [dataProducts, dataBrands] = await Promise.all([
                productsServices.getAllProducts(),
                brandsServices.getAllBrands(),
            ])

            // setBrands(dataBrands)
            setProducts(dataProducts)
            // setBrands(dataBrands)
            setLoading(false)
        }

        init()
    }, [])

    const visibleProducts = products.slice(0, page * PAGE_SIZE)


    const loadMore = useCallback(() => {
        if (visibleProducts.length < products.length && !loading) {
        setPage((prev) => prev + 1)
        }
    }, [visibleProducts.length, products.length, loading])

    useInfiniteScroll(loadMore)


    return (
        <>
        <section className="mx-auto max-w-7xl px-4 py-6">
            <ProductMasonry
                products={visibleProducts}
                renderItem={(product) => (
                    <>
                    {/* <ProductCard key={product.id} product={product} /> */}
                    <ProductCardHover key={product.id} product={product} onClick={() => setQuickViewProduct(product)}/>
                    {/* <ProductCardDots product={product} onClick={() => setQuickViewProduct(product)}/> */}
                    </>
                )}
            />

        {visibleProducts.length < productsMock.length && (
            <p className="mt-6 text-center text-sm text-slate-500">
            Cargando más productos...
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