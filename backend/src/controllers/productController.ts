import Product from "../models/Product";
import { Response, Request, NextFunction } from "express";

const SIZE_ALIASES: Record<string, string[]> = {
  XXL: ['XXL', '2XL'],
  '3XL': ['3XL', 'XXXL'],
  '4XL': ['4XL', 'XXXXL'],
  'ÚNICA': ['ÚNICA', 'UNICA', 'OS', 'OSFA', 'ALL', 'STD', 'TU']
}

const escapeRegex = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

// Productos que se muestran en los listados: activos y con al menos una imagen.
// Los retirados o sin imagen siguen accesibles por ID y desde favoritos.
const LISTABLE_FILTER = {
  isActive: { $ne: false },
  // Ojo: $nin con null sobre una ruta de array ("images.0.src") descarta todo.
  'images.0.src': { $type: 'string', $gt: '' }
}

// PRNG determinístico (mulberry32): misma semilla → misma secuencia
const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0
  let t = seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Baraja (Fisher-Yates) con semilla: la misma semilla da el mismo orden,
// así la paginación del orden aleatorio es estable entre páginas.
const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const rand = seededRandom(seed)
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

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

    const filter: any = { ...LISTABLE_FILTER }
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

    const minPrice = Number(req.query.minPrice)
    const maxPrice = Number(req.query.maxPrice)
    if (req.query.minPrice !== undefined && Number.isFinite(minPrice) && minPrice >= 0) {
      filter.price = { ...filter.price, $gte: minPrice }
    }
    if (req.query.maxPrice !== undefined && Number.isFinite(maxPrice) && maxPrice >= 0) {
      filter.price = { ...filter.price, $lte: maxPrice }
    }

    if (req.query.size) {
      const sizeMatchers = String(req.query.size).split(',').map(size => size.trim()).filter(Boolean).slice(0, 20)
        .map(size => {
          const aliases = SIZE_ALIASES[size.toUpperCase()] || [size]
          return new RegExp('(^|[\\s/-])(?:' + aliases.map(escapeRegex).join('|') + ')(?=$|[\\s/-])', 'i')
        })
      if (sizeMatchers.length) {
        filter.variants = {
          $elemMatch: {
            inStock: true,
            $or: [
              { size: { $in: sizeMatchers } },
              { title: { $in: sizeMatchers } }
            ]
          }
        }
      }
    }

    if (req.query.onSale === 'true') {
      filter.$expr = {
        $anyElementTrue: [{
          $map: {
            input: { $ifNull: ['$variants', []] },
            as: 'variant',
            in: {
              $and: [
                { $isNumber: '$$variant.price' },
                { $isNumber: '$$variant.comparePrice' },
                { $gt: ['$$variant.comparePrice', '$$variant.price'] }
              ]
            }
          }
        }]
      }
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

    if (sort === 'random') {
      const parsedSeed = Number(req.query.seed)
      const seed = Number.isInteger(parsedSeed) ? parsedSeed : Math.floor(Math.random() * 2 ** 31)

      // Solo IDs (liviano) en orden fijo, luego se barajan con la semilla
      const ids = await Product.find(filter).sort({ _id: 1 }).select('_id').lean()
      const shuffled = seededShuffle(ids.map(doc => String(doc._id)), seed)
      const pageIds = shuffled.slice(skip, skip + limit)

      const docs = await Product.find({ _id: { $in: pageIds } }).populate('brand')
      const byId = new Map(docs.map(doc => [String(doc._id), doc]))
      const products = pageIds.map(id => byId.get(id)).filter(Boolean)

      const total = shuffled.length
      const pages = Math.ceil(total / limit)
      return res.status(200).json({ success: true, data: products, total, page, pages, hasMore: page < pages, seed })
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

    const products = await Product.find(LISTABLE_FILTER)
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

    const products = await Product.find(LISTABLE_FILTER)
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
      ...LISTABLE_FILTER,
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
          ...LISTABLE_FILTER,
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
