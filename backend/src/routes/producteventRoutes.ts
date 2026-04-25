import express from 'express';
import rateLimit from 'express-rate-limit';
import { createProductEvent } from "../controllers/productEventController"
import { collectUser } from '../middleware/authMiddleware';

const router = express.Router();

const productEventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados eventos registrados desde esta IP. Intenta nuevamente más tarde.' }
});

// Ruta para crear evento del producto (publico o privado)
router.post('/', productEventLimiter, collectUser, createProductEvent);

export default router;
