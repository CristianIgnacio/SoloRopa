import express from 'express';
import { getCurrentUser, login, googleLogin, logout, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Límite de intentos para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limita a 10 requests por IP por periodo
  message: { error: 'Demasiados intentos de inicio de sesión, intenta nuevamente después de 15 minutos' }
});

// Límite de intentos para pedir recuperación de contraseña
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Limita a 5 requests por IP por periodo
  message: { error: 'Demasiadas solicitudes de recuperación, intenta nuevamente más tarde' }
});

router.get("/login/me", authenticate, getCurrentUser)

router.post("/login", loginLimiter, login)
router.post("/google", loginLimiter, googleLogin)
router.post("/logout", logout)

router.post("/forgot-password", resetLimiter, forgotPassword)
router.post("/reset-password/:token", resetLimiter, resetPassword)

export default router;