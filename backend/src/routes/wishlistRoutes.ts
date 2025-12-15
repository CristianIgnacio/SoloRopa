import express from "express"
import {getUserWishlists, createWishlist, addItemToWishlist, deleteItemToWishlist, deleteWishlist, updateWishlist, getWishlistById, toggleFavorite} from "../controllers/wishlistController"
import {authenticate} from "../middleware/authMiddleware"

const router = express.Router();

// Crear wishlist
router.post("/", authenticate, createWishlist);

// Eliminar whislist
router.post("/:id", authenticate, deleteWishlist);

// Actualizar whislist
router.put("/", authenticate, updateWishlist);

// Agregar producto
router.post("/:id/items", authenticate, addItemToWishlist);

// Quitar producto
router.delete("/:id/items/:productId", authenticate, deleteItemToWishlist);

// Ver wishlist de usuario
router.get("/", authenticate, getUserWishlists);

// Ver wishlist por id
router.get("/:id", authenticate, getWishlistById);

// Toggle favorite item
router.post("/default/toggle", authenticate, toggleFavorite);


export default router
