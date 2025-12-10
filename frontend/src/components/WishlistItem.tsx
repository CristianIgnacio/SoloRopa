import { Box, Card, CardContent, CardMedia, Typography, IconButton, Button } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import { useWishlistStore } from "../store/wishlistStore"; // Si usas Zustand
// import ProductCarousel from "./ProductCarousel";             // Opcional si tienes carrusel
// import type { Product } from "../Types/Types";

const WishlistItem = (products : any ) => {
//   const removeFromWishlist = useWishlistStore((s) => s.remove); // Si usas Zustand
    const imagen = "https://cdn.shopify.com/s/files/1/0249/8255/2638/files/ongod20.png?v=1757700795"
    
    const {product} = products

    return (
        <Card sx={{ borderRadius: 3, overflow: "hidden", position: "relative" }}>
        
        {/* Imagen o carrusel */}
        {!imagen ? (
            // <ProductCarousel images={product.images} />
            <></>
        ) : (
            <CardMedia
            component="img"
            height="500"
            image={imagen}
            alt={product.title}
            sx={{ objectFit: "cover" }}
            />
        )}

        {/* Botón eliminar */}
        <IconButton
            // onClick={() => removeFromWishlist(product.id)}
            sx={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255,255,255,0.7)",
            "&:hover": { background: "rgba(255,255,255,1)" }
            }}
        >
            <FavoriteIcon sx={{ color: "red" }} />
        </IconButton>

        <CardContent>
            <Typography variant="h6" fontWeight={600}>
            {product.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
            {product.brand.name}
            </Typography>

            <Typography variant="h6" color="primary" mt={1} mb={2}>
            ${product.price}
            </Typography>

            <Button 
            variant="contained" 
            fullWidth 
            onClick={() => console.log("Ver producto", product.id)}
            >
            Ver producto
            </Button>
        </CardContent>
        </Card>
    );
}

export default WishlistItem
