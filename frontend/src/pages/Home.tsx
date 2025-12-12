import { useEffect, useState, useCallback} from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type {Product, Brand} from "../Types/Types"
import ProductMasonry from "../components/product/ProductMansory"
import { productsMock } from "../mocks/products.mocks"
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll"

const PAGE_SIZE = 20

const Home = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [brands, setBrands] = useState<Brand[] | []>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)

    console.log(brands)

    useEffect(() => {
        const init = async () => {
            setLoading(true)

            const [dataProducts, dataBrands] = await Promise.all([
                productsServices.getAllProducts(),
                brandsServices.getAllBrands(),
            ])

            // setBrands(dataBrands)
            setProducts(dataProducts)
            setBrands(dataBrands)
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
        <section className="mx-auto max-w-7xl px-4 py-6">
        <ProductMasonry products={visibleProducts} />

        {visibleProducts.length < productsMock.length && (
            <p className="mt-6 text-center text-sm text-slate-500">
            Cargando más productos...
            </p>
        )}
        </section>
    )

}

export default Home