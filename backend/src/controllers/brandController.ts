import Brand from "../models/Brand"
import { Response, Request, NextFunction } from "express";

// Obtner todos los productos
const getAllBrands = async (req : Request, res : Response, next : NextFunction) => {
  try {
    const brands = await Brand.find({})

    res.status(200).json({
      success : true,
      data : brands
    })
  }
  catch (err){
    next(err);
  }
}


// // Obtener todas las marcas
// const getAllBrands = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const { isActive, search, page = "1", limit  = "10" } = req.query;
        
//         // Construir filtros
//         const filter = {};
//         // if (isActive !== undefined) {
//         //     filter = {...filter, isActive : isActive === 'true'};
//         // }
//         // if (search) {
//         //     filter = {...filter, name : { $regex: search, $options: 'i' }};
//         // }

//         // Paginación
//         const skip = (Number(page) - 1) * Number(limit);
        
//         const brands = await Brand.find(filter)
//         .limit(Number(limit))
//         .skip(skip)
//         .sort({ name: 1 });

//         const total = await Brand.countDocuments(filter);

//         res.status(200).json({
//             success: true,
//             count: brands.length,
//             total,
//             page: Number(page),
//             pages: Math.ceil(total / Number(limit)),
//             data: brands
//         });
//     } catch (err) {
//         next(err);
//     }
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error al obtener las marcas',
// //       error: error.message
// //     });
// //   }
// };

// // Obtener una marca por ID
// const getBrandById = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const brand = await Brand.findById(req.params.id);

//         if (!brand) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Marca no encontrada'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: brand
//         });

//     } catch (err) {
//         next(err);
//     }
    
//     // } catch (error) {
//     //     res.status(500).json({
//     //     success: false,
//     //     message: 'Error al obtener la marca',
//     //     error: error.message
//     //     });
//     // }
// };

// // Obtener una marca por slug
// const getBrandBySlug = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const brand = await Brand.findOne({ slug: req.params.slug });

//     if (!brand) {
//       return res.status(404).json({
//         success: false,
//         message: 'Marca no encontrada'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: brand
//     });
//     } catch (err) {
//         next(err);
//     }
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error al obtener la marca',
// //       error: error.message
// //     });
// //   }
// };

// // Crear una nueva marca
// const createBrand = async (req : Request, res : Response, next : NextFunction) => {
//   try {
//     const brand = await Brand.create(req.body);

//     res.status(201).json({
//         success: true,
//         message: 'Marca creada exitosamente',
//         data: brand
//     });
//     } catch (err) {
//         next(err);
//     }
  
// //   catch (error) {
// //     if (error.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Ya existe una marca con ese nombre'
// //       });
// //     }

// //     res.status(400).json({
// //       success: false,
// //       message: 'Error al crear la marca',
// //       error: error.message
// //     });
// //   }
// };

// // Actualizar una marca
// const updateBrand = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const brand = await Brand.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true, // Devuelve el documento actualizado
//             runValidators: true // Ejecuta las validaciones del schema
//         }
//         );

//         if (!brand) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Marca no encontrada'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Marca actualizada exitosamente',
//             data: brand
//         });
//     } catch (err) {
//         next(err);
//     }
// //   } catch (error) {
// //     res.status(400).json({
// //       success: false,
// //       message: 'Error al actualizar la marca',
// //       error: error.message
// //     });
// //   }
// };

// // Eliminar una marca
// const deleteBrand = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const brand = await Brand.findByIdAndDelete(req.params.id);

//         if (!brand) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Marca no encontrada'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Marca eliminada exitosamente',
//             data: {}
//         });
//     } catch (err) {
//         next(err);
//     }
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error al eliminar la marca',
// //       error: error.message
// //     });
// //   }
// };

// // Alternar estado activo/inactivo
// const toggleBrandStatus = async (req : Request, res : Response, next : NextFunction) => {
//     try {
//         const brand = await Brand.findById(req.params.id);

//         if (!brand) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Marca no encontrada'
//             });
//         }

//         brand.isActive = !brand.isActive;
//         await brand.save();

//         res.status(200).json({
//             success: true,
//             message: `Marca ${brand.isActive ? 'activada' : 'desactivada'} exitosamente`,
//             data: brand
//         });
        
//     } catch (err) {
//         next(err);
//     }
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error al cambiar el estado de la marca',
// //       error: error.message
// //     });
// //   }
// };

export {
  getAllBrands
}