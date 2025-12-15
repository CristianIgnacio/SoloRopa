import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from "path";


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
    cb(new Error('Formato no válido. Solo JPG, PNG o WebP.'));
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

// import multer from "multer";
// import path from "path";

// // Carpeta donde se guardarán las imágenes
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/avatars");
//   },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, uniqueName + ext);
//   },
// });

// export const upload = multer({ storage });