import express from "express"
import {getMeWishlists, createWishlist, addItemToWishlist, deleteItemToWishlist, deleteWishlist, updateWishlist, getWishlistById, toggleFavorite,getUserWishlists} from "../controllers/wishlistController"
import {authenticate, collectUser} from "../middleware/authMiddleware"

const router = express.Router();

// Crear wishlist
router.post("/", authenticate, createWishlist);

// Eliminar wishlist
router.delete("/:id", authenticate, deleteWishlist);

// Actualizar wishlist (usa :id en la ruta)
router.put("/:id", authenticate, updateWishlist);

// Agregar producto
router.post("/:id/items", authenticate, addItemToWishlist);

// Quitar producto
router.delete("/:id/items/:productId", authenticate, deleteItemToWishlist);

// Obtener wishlist de usuario
router.get("/", authenticate, getMeWishlists);

// Obtener wishlist de usuario
router.get("/:username/username", getUserWishlists);

// Obtener wishlist por id
router.get("/:id", collectUser, getWishlistById);

// Toggle favorite item
router.post("/default/toggle", authenticate, toggleFavorite);


export default router
