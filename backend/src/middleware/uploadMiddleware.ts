import multer, { FileFilterCallback } from 'multer';
import { NextFunction, Request, Response } from 'express';
import path from "path";
import fs from 'fs';
import * as FileType from 'file-type';

// Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileFilter = (
  req: Request, 
  file: Express.Multer.File, 
  cb: FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // El error debe manejarse como null en el primer argumento para tipos estrictos, 
    // pero pasamos un error estándar.
    cb(new Error('Formato no válido en header. Solo JPG, PNG o WebP.'));
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

export const validateMagicBytes = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  try {
    const buffer = fs.readFileSync(req.file.path);
    const type = await FileType.fromBuffer(buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!type || !allowedMimeTypes.includes(type.mime)) {
      // Eliminar el archivo malicioso guardado temporalmente
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'El archivo es corrupto o no es una imagen válida (magic bytes).' });
      return;
    }
    next();
  } catch (error) {
    if (req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error procesando la imagen.' });
    return;
  }
};