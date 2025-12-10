// import {getAllBrands, getBrandById, getBrandBySlug, createBrand, deleteBrand, updateBrand, toggleBrandStatus} from "../controllers/brandController"
import express from "express";
import { getAllBrands } from "../controllers/brandController";

const router = express.Router();

// // Rutas públicas
router.get('/', getAllBrands);
// router.get('/:id', getBrandById);
// router.get('/slug/:slug', getBrandBySlug);

// // Rutas protegidas (agregar middleware de autenticación si es necesario)
// router.post('/', createBrand);
// router.put('/:id', updateBrand);
// router.delete('/:id', deleteBrand);
// router.patch('/:id/toggle-status', toggleBrandStatus);

export default router