import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";

// Obtener productos paginados
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const sort = (req.query.sort as string) || 'createdAt'
    const order = req.query.order === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    const allowedSortFields = ['createdAt', 'price', 'trendingScore', 'favoritesCount', 'title']
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt'

    const filter: any = {}
    if (req.query.brand) {
      const brands = String(req.query.brand).split(',')
      filter.brand = brands.length > 1 ? { $in: brands } : brands[0]
    }

    if (req.query.category) {
      const cats = String(req.query.category).split(',')
      filter.category = cats.length > 1 ? { $in: cats } : cats[0]
    }

    if (req.query.gender) {
      const genders = String(req.query.gender).split(',')
      filter.gender = genders.length > 1 ? { $in: genders } : genders[0]
    }

    if (req.query.q) {
      const qRegex = new RegExp(String(req.query.q), "i")
      filter.$or = [
        { title: qRegex },
        { tags: qRegex },
        { category: qRegex }
      ]
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {}
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice)
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice)
    }

    // Filtros sobre canonicalTags (fit, style, color)
    if (req.query.fit) {
      filter['canonicalTags.fit'] = { $in: String(req.query.fit).split(',') }
    }

    if (req.query.style) {
      filter['canonicalTags.style'] = { $in: String(req.query.style).split(',') }
    }

    if (req.query.color) {
      filter['canonicalTags.color'] = { $in: String(req.query.color).split(',') }
    }

    if (req.query.inStock === 'true') {
      filter.inStock = true
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('brand')
        .sort({ [sortField]: order })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
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

// Obtener productos relacionados por categoría (misma marca primero)
const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const limit = Math.min(20, Number(req.query.limit) || 10)

    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' })

    // Misma marca misma categoría (excluye el propio)
    const sameBrandSameCategory = await Product.find({
      _id: { $ne: product._id },
      brand: product.brand,
      category: product.category
    }).limit(limit).populate('brand')

    // Completar con misma categoría de cualquier marca si faltan
    const remaining = limit - sameBrandSameCategory.length
    const sameCategoryIds = sameBrandSameCategory.map(p => p._id)
    const extraIds = [product._id, ...sameCategoryIds]

    const otherCategory = remaining > 0
      ? await Product.find({
          _id: { $nin: extraIds },
          category: product.category
        }).limit(remaining).populate('brand')
      : []

    const related = [...sameBrandSameCategory, ...otherCategory]

    res.json({ success: true, data: related })
  } catch (err) {
    next(err)
  }
}

export { getAllProducts, getProductById, getTrendingProducts, getNewestProducts, getRelatedProducts }