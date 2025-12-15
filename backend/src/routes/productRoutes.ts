import express from 'express';
import {getAllProducts} from '../controllers/productController';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts);
// router.get('/featured', getFeaturedProducts);
// router.get('/brand/:brandId', getProductsByBrand);
// router.get('/:id', getProductById);
// router.get('/slug/:slug', getProductBySlug);

// // Rutas protegidas (agregar middleware de autenticación si es necesario)
// router.post('/', createProduct);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);
// router.patch('/:id/toggle-status', toggleProductStatus);
// router.patch('/:id/stock', updateStock);

export default router;