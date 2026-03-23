import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";

// Obtener productos paginados
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const sort = (req.query.sort as string) || 'createdAt'
    const order = req.query.order === 'asc' ? 1 : -1

    const skip = (page - 1) * limit

    const allowedSortFields = ['createdAt', 'price', 'trendingScore', 'favoritesCount', 'title']
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt'

    const [products, total] = await Promise.all([
      Product.find({})
        .populate('brand')
        .sort({ [sortField]: order })
        .skip(skip)
        .limit(limit),
      Product.countDocuments({})
    ])

    const pages = Math.ceil(total / limit)

    res.status(200).json({
      success: true,
      data: products,
      total,
      page,
      pages,
      hasMore: page < pages
    })
  } catch (err) {
    next(err)
  }
}

// Obtener un producto por ID
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
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
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
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

const getTrendingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 20)

    const products = await Product.find()
      .sort({ trendingScore: -1 })
      .limit(limit)
      .populate("brand")

    res.json({ success: true, data: products })

  } catch (err) {
    next(err)
  }
}

// Obtener los productos más nuevos (para sección curatorial)
const getNewestProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 15)

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("brand")

    res.json({ success: true, data: products })

  } catch (err) {
    next(err)
  }
}

export { getAllProducts, getProductById, getTrendingProducts, getNewestProducts }