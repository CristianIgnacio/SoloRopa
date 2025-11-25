import {Container, Grid} from "@mui/material"
import CardProduct from "../components/CardProduct"
import { useEffect, useState} from "react"
import productsServices from "../services/products"
import type {Product} from "../Types/Types"

const Home = () => {
    const [products, setProducts] = useState<Product[]>()

    useEffect(() => {
        const init = async () => {
            const dataProducts = await productsServices.getAllProducts()
            console.log(dataProducts)
            setProducts(dataProducts)
        }

        init()
    }, [])

    if(!products) return 

    return (
        <Container fixed >
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