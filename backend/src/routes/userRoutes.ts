import express from "express";
import rateLimit from "express-rate-limit";
import { createUser, getUsers, getUserById, getUserbyUsername, updateMyNotifications, unsubscribePriceDrops } from "../controllers/userController";
import { upload, validateMagicBytes } from "../middleware/uploadMiddleware";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

// Desuscribirse desde un correo no requiere sesión: limitar intentos por IP.
const unsubscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiadas solicitudes, intenta nuevamente en unos minutos" },
});

// Obtiene todos los usuarios
// router.get("/", getUsers);

// Obtiene un usuario según su id
// router.get("/:id", getUserById);

// Preferencias de correo del usuario con sesión
router.patch("/me/notifications", authenticate, updateMyNotifications);

// Link "dejar de recibir avisos" de los correos (token firmado, sin sesión)
router.post("/unsubscribe/price-drops", unsubscribeLimiter, unsubscribePriceDrops);

// Obtiene un usuario según su username
router.get("/:username", getUserbyUsername);

// Crea un usuario
router.post("/", upload.single("avatarUrl"), validateMagicBytes, createUser);

export default router;
