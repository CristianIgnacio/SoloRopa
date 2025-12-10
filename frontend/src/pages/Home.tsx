import {Container, Grid} from "@mui/material"
import CardProduct from "../components/CardProduct"
import { useEffect, useState} from "react"
import productsServices from "../services/products"
import brandsServices from "../services/brands"
import type {Product, Brand} from "../Types/Types"
import BrandCarousel from "../components/BrandCarousel"

const Home = () => {
    const [products, setProducts] = useState<Product[]>()
    const [brands, setBrands] = useState<Brand[] | []>([])


    useEffect(() => {
        const init = async () => {
            const dataProducts = await productsServices.getAllProducts()
            const dataBrands = await brandsServices.getAllBrands()

            setBrands(dataBrands)
            setProducts(dataProducts)
        }

        init()
    }, [])

    if(!products) return 

    return (
        <Container fixed >
            <BrandCarousel brands={brands}/>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {products.map( (p) => (
                    <Grid key={p.id} size={{ xs: 2, sm: 4, md: 4 }}>
                        <CardProduct product={p}/>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}

export default Home