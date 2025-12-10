import express from "express"
import {getUserWishlists, createWishlist, addItemToWishlist, deleteItemToWishlist, deleteWishlist, updateWishlist} from "../controllers/wishlistController"

const router = express.Router();

// Crear wishlist
router.post("/", createWishlist);

// Eliminar whislist
router.post("/:id", deleteWishlist);

// Actualizar whislist
router.put("/", updateWishlist);

// Agregar producto
router.post("/:id/items", addItemToWishlist);

// Quitar producto
router.delete("/:id/items/:productId", deleteItemToWishlist);

// Ver wishlist de usuario
router.get("/", getUserWishlists);

export default router
