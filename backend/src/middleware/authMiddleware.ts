import { Request, Response, NextFunction } from 'express';
import config from '../utils/config';
import jwt from "jsonwebtoken"
import UserModel from '../models/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "missing token" });
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as any;
    const csrfToken = req.headers["x-csrf-token"];

    if (decodedToken.id && decodedToken.csrf === csrfToken) {
      req.userId = decodedToken.id;
      next();
    } else {
      res.status(401).json({ error: "invalid token or csrf" });
    }
  } catch (err) {
    res.status(401).json({ error: "invalid token" });
  }
};

/**
 * Middleware para capturar el userId si existe, pero no bloquear si no hay sesión.
 * Útil para eventos de productos por invitados.
 */
export const collectUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as any;
    const csrfToken = req.headers["x-csrf-token"];

    if (decodedToken.id && decodedToken.csrf === csrfToken) {
      req.userId = decodedToken.id;
    }
  } catch (err) {
    // Ignoramos el error, el usuario queda como invitado
  }
  next();
};

// Middleware de autorización por rol
export const authorizeRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "No autenticado" });
    }
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
};
