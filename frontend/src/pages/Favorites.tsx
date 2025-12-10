import { Box, Grid, Typography } from "@mui/material";
import WishlistItem from "../components/WishlistItem";
import {getUserWishlists} from "../services/wishlist"
import { useEffect, useState } from "react";
import type { Product } from "../Types/Types";

// Ejemplo de datos (puedes conectarlo con Zustand o API)
const sampleWishlist = [
  {
    id: 1,
    title: "Polera Oversize Negra",
    price: 19990,
    brand: "FreshBrand",
    images: [
      "/products/shirt1.webp",
      "/products/shirt1-b.webp"
    ]
  },
  {
    id: 2,
    title: "Polerón Premium",
    price: 34990,
    brand: "Errante",
    images: [
      "/products/hoodie1.webp",
      "/products/hoodie1.webp",
    ]
  }
];

const WishlistPage = () => {
  const wishlist = sampleWishlist.concat(sampleWishlist).concat(sampleWishlist).concat(sampleWishlist).concat(sampleWishlist); // ← reemplaza por Zustand o fetch

    const [favorites, setFavorites] = useState()

    useEffect(() => {
        const init = async () => {
            const dataProducts = await getUserWishlists()
            setFavorites(dataProducts)
        }

        init()
    }, [])

    console.log(favorites)

    return (
        <Box sx={{ width: "100%", px: 2, py: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
            Tu Wishlist ❤️
        </Typography>

        {wishlist.length === 0 ? (
            <Typography variant="h6" color="text.secondary">
            No tienes productos guardados aún.
            </Typography>
        ) : (
            <Grid container spacing={3}>
            {wishlist.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg : 3 }} key={product.id}>
                <WishlistItem product={product} />
                </Grid>
            ))}
            </Grid>
        )}
        </Box>
    );
}

export default WishlistPage