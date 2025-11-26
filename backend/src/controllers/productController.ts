import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";

// Obtner todos los productos
const getAllProducts = async (req : Request, res : Response, next : NextFunction) => {
  try {
      const products = await Product.find({}).populate('brand');

      res.status(200).json({
          success : true,
          data : products
      })
  }
  catch (err){
      next(err);
  }
}

// Obtener un producto por ID
const getProductById = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (err) {
      next(err);
  }

};

// Crear un nuevo producto
export const createProduct = async (req : Request, res : Response, next : NextFunction) => {
  try {

    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id).populate('brand');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: populatedProduct
    });

  } catch (err) {
      next(err);
  }

};

export {getAllProducts, getProductById}

// // Obtener todos los productos
// export const getAllProducts = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const {
//             search,
//             category,
//             brand,
//             minPrice,
//             maxPrice,
//             isActive,
//             isFeatured,
//             inStock,
//             sortBy = 'createdAt',
//             order = 'desc',
//             page = 1,
//             limit = 10
//         } = req.query;

//         // Construir filtros
//         const filter : any = {};

//         // if (search) {
//         // filter.$or = [
//         //     { name: { $regex: search, $options: 'i' } },
//         //     { description: { $regex: search, $options: 'i' } },
//         //     { tags: { $in: [new RegExp(String(search), 'i')] } }
//         // ];
//         // }

//         // if (category) filter.category = category;
//         // if (brand) filter.brand = brand;
//         // if (isActive !== undefined) filter.isActive = isActive === 'true';
//         // if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
//         // if (inStock === 'true') filter.stock = { $gt: 0 };

//         // if (minPrice || maxPrice) {
//         // filter.price = {};
//         // if (minPrice) filter.price.$gte = Number(minPrice);
//         // if (maxPrice) filter.price.$lte = Number(maxPrice);
//         // }

//         // Paginación
//         const skip = (Number(page) - 1) * Number(limit);

//         // Ordenamiento
//         // const sortOrder = order === 'asc' ? 1 : -1;
//         // const sortOptions = { sortBy : sortOrder };

//         const products = await Product.find(filter)
//         .populate('brand', 'name logo slug')
//         .limit(Number(limit))
//         .skip(skip)
//         // .sort(sortOptions);

//         const total = await Product.countDocuments(filter);

//         res.status(200).json({
//             success: true,
//             count: products.length,
//             total,
//             page: Number(page),
//             pages: Math.ceil(total / Number(limit)),
//             data: products
//         });
//     } catch (err) {
//         next(err);
//     }

// };

// // Obtener un producto por ID
// export const getProductById = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const product = await Product.findById(req.params.id).populate('brand');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Producto no encontrado'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: product
//     });

//     } catch (err) {
//         next(err);
//     }

// };

// // Obtener un producto por slug
// export const getProductBySlug = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const product = await Product.findOne({ slug: req.params.slug }).populate('brand');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Producto no encontrado'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: product
//     });
//     } catch (err) {
//         next(err);
//     }

// };



// // Actualizar un producto
// export const updateProduct = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const product = await Product.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true
//         }
//         ).populate('brand');

//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Producto no encontrado'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Producto actualizado exitosamente',
//             data: product
//         });
        
//     } catch (err) {
//         next(err);
//     }

// };

// // Eliminar un producto
// export const deleteProduct = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const product = await Product.findByIdAndDelete(req.params.id);

//         if (!product) {
//         return res.status(404).json({
//             success: false,
//             message: 'Producto no encontrado'
//         });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Producto eliminado exitosamente',
//             data: {}
//         });
//     } catch (err) {
//         next(err);
//     }

// };

// // Alternar estado activo/inactivo
// export const toggleProductStatus = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const product = await Product.findById(req.params.id);

//         if (!product) {
//         return res.status(404).json({
//             success: false,
//             message: 'Producto no encontrado'
//         });
//         }

//         product.isActive = !product.isActive;
//         await product.save();

//         res.status(200).json({
//         success: true,
//         message: `Producto ${product.isActive ? 'activado' : 'desactivado'} exitosamente`,
//         data: product
//         });
//     } catch (err) {
//         next(err);
//     }

// };

// // Actualizar stock
// export const updateStock = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const { stock } = req.body;

//         if (stock === undefined || stock < 0) {
//         return res.status(400).json({
//             success: false,
//             message: 'El stock debe ser un número mayor o igual a 0'
//         });
//         }

//         const product = await Product.findByIdAndUpdate(
//         req.params.id,
//         { stock },
//         { new: true, runValidators: true }
//         );

//         if (!product) {
//         return res.status(404).json({
//             success: false,
//             message: 'Producto no encontrado'
//         });
//         }

//         res.status(200).json({
//         success: true,
//         message: 'Stock actualizado exitosamente',
//         data: product
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// // Obtener productos por marca
// export const getProductsByBrand = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const products = await Product.find({ brand: req.params.brandId })
//         .populate('brand');

//         res.status(200).json({
//             success: true,
//             count: products.length,
//             data: products
//         });
//     } catch (err) {
//         next(err);
//     }
// };

// // Obtener productos destacados
// export const getFeaturedProducts = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const { limit = 10 } = req.query;

//         const products = await Product.find({ 
//         isFeatured: true, 
//         isActive: true 
//         })
//         .populate('brand')
//         .limit(Number(limit))
//         .sort({ createdAt: -1 });

//         res.status(200).json({
//         success: true,
//         count: products.length,
//         data: products
//         });

//     } catch (err) {
//         next(err);
//     }

// };

// export default {
//     getAllProducts,
//     getFeaturedProducts,
//     getProductById,
//     getProductBySlug,
//     getProductsByBrand,
//     updateProduct,
//     createProduct,
//     deleteProduct,
// }