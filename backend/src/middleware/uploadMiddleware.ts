import multer, { FileFilterCallback } from 'multer';
import { NextFunction, Request, Response } from 'express';
import path from "path";
import fs from 'fs';

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

const isJpeg = (buffer: Buffer) =>
  buffer.length >= 3 &&
  buffer[0] === 0xff &&
  buffer[1] === 0xd8 &&
  buffer[2] === 0xff;

const isPng = (buffer: Buffer) =>
  buffer.length >= 8 &&
  buffer[0] === 0x89 &&
  buffer[1] === 0x50 &&
  buffer[2] === 0x4e &&
  buffer[3] === 0x47 &&
  buffer[4] === 0x0d &&
  buffer[5] === 0x0a &&
  buffer[6] === 0x1a &&
  buffer[7] === 0x0a;

const isWebp = (buffer: Buffer) =>
  buffer.length >= 12 &&
  buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
  buffer.subarray(8, 12).toString('ascii') === 'WEBP';

const getMimeTypeFromBuffer = (buffer: Buffer): string | null => {
  if (isJpeg(buffer)) return 'image/jpeg';
  if (isPng(buffer)) return 'image/png';
  if (isWebp(buffer)) return 'image/webp';

  return null;
};

export const validateMagicBytes = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  try {
    const buffer = fs.readFileSync(req.file.path);
    const mimeType = getMimeTypeFromBuffer(buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
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
