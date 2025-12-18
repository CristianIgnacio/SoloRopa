import express from "express";
import { createUser, getUsers, getUserById, getUserbyUsername } from "../controllers/userController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Obtiene todos los usuarios
// router.get("/", getUsers);

// Obtiene un usuario según su id
// router.get("/:id", getUserById);

// Obtiene un usuario según su username
router.get("/:username", getUserbyUsername);

// Crea un usuario
router.post("/", upload.single("avatarUrl"), createUser);

export default router;