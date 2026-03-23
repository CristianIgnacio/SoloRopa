import express from 'express';
import {createProductEvent} from "../controllers/productEventController"
import { collectUser } from '../middleware/authMiddleware';

const router = express.Router();

// Ruta para crear evento del producto (público o privado)
router.post('/', collectUser, createProductEvent);

export default router;