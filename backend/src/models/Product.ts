import mongoose, { model, Schema, Document } from "mongoose"
import { ProductCategory, PRODUCT_CATEGORIES } from "../constants/productCategories";
import { Gender } from "../scrapers/domain/enums";
import type {CanonicalTags} from "../scrapers/domain/Tag"

export interface IProduct extends Document {
  // info
  title: string;
  brand: mongoose.Schema.Types.ObjectId;
  url: string;

  //media
  images: { src: string; alt?: string }[];
  
  // precios
  price: number | null;
  currency?: string | null;
  inStock?: boolean;
  isActive?: boolean;

  // categorias y genero
  category : ProductCategory;
  categoryConfidence: number
  gender?: Gender;

  // tags
  tags : string[],
  canonicalTags?: CanonicalTags

  // variacion (tallas, color)
  variants?: { title: string; color?: string; size?: string; sku?: string; price?: number; comparePrice? : number ; inStock?: boolean }[];

  // Metricas de tendencia
  viewsCount : number,
  favoritesCount : number,
  clicksCount : number,

  viewsLastNDays : number,
  favoritesLastNDays : number,
  clicksLastNDays : number,

  trendingScore : number,
  lastUpdateScore : Date,
  
  scrapedAt: Date;
  raw?: any;          // guarda el JSON/HTML bruto si quieres
}

const ProductSchema = new Schema<IProduct>({
  brand: { type: mongoose.Schema.Types.ObjectId, ref:'Brand', required: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: false },
  currency: { type: String, required: false },
  url: { type: String, required: true, unique: false },
  images: [{
    src: {type: String, required: true},
    alt: {type: String, default: ''}
  }],
  inStock: { type: Boolean, required: false },
  isActive: { type: Boolean, required: false },
  category : {type : String, enum: PRODUCT_CATEGORIES,default : "otros", lowercase : true},
  categoryConfidence : {type : Number, default: 0},
  gender: { type: String, enum: Object.values(Gender), required: false },
  tags : [{type : String, lowercase : true}],
  canonicalTags: {
    type: Schema.Types.Mixed,
    required: false,
    default: {}
  },
  variants: [{
    title: { type: String, required: true },
    color: { type: String, required: false },
    size: { type: String, required: false },
    sku: { type: String, required: false },
    price: { type: Number, required: false },
    comparePrice: { type: Number, required: false },
    inStock: { type: Boolean, required: false }
  }],
  viewsCount : { type : Number, default : 0, required : true},
  favoritesCount : { type : Number, default : 0, required : true},
  clicksCount : { type : Number, default : 0, required : true},
  viewsLastNDays : { type : Number, default : 0, required : true},
  favoritesLastNDays : { type : Number, default : 0, required : true},
  clicksLastNDays : { type : Number, default : 0, required : true},
  trendingScore : { type : Number, default : 0, required : true},
  lastUpdateScore : { type : Date, default: () => new Date(), required : true},
  scrapedAt: { type: Date, default: () => new Date() },
  raw: { type: Schema.Types.Mixed }
}, { 
  timestamps: true
});

// Índices para mejorar el rendimiento de búsquedas
ProductSchema.index({ brand: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ trendingScore: -1 });
ProductSchema.index({ title: 'text' });

ProductSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ProductModel = model<IProduct>("Product", ProductSchema);

export default ProductModel

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'El nombre del producto es requerido'],
//     trim: true,
//     maxlength: [200, 'El nombre no puede exceder 200 caracteres']
//   },
//   slug: {
//     type: String,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: [true, 'La descripción es requerida'],
//     maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
//   },
//   price: {
//     type: Number,
//     required: [true, 'El precio es requerido'],
//     min: [0, 'El precio no puede ser negativo']
//   },
//   comparePrice: {
//     type: Number,
//     min: [0, 'El precio de comparación no puede ser negativo']
//   },
//   brand: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Brand',
//     required: [true, 'La marca es requerida']
//   },
//   category: {
//     type: String,
//     required: [true, 'La categoría es requerida'],
//     trim: true
//   },
//   images: [{
//     url: {
//       type: String,
//       required: true
//     },
//     alt: {
//       type: String,
//       default: ''
//     }
//   }],
//   stock: {
//     type: Number,
//     required: [true, 'El stock es requerido'],
//     min: [0, 'El stock no puede ser negativo'],
//     default: 0
//   },
//   sku: {
//     type: String,
//     unique: true,
//     sparse: true,
//     trim: true
//   },
//   tags: [{
//     type: String,
//     trim: true
//   }],
//   specifications: {
//     type: Map,
//     of: String
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   isFeatured: {
//     type: Boolean,
//     default: false
//   },
//   rating: {
//     average: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 5
//     },
//     count: {
//       type: Number,
//       default: 0
//     }
//   }
// }, {
//   timestamps: true
// });

// // Middleware para generar el slug antes de guardar
// productSchema.pre('save', function(next) {
//   if (this.isModified('name')) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '');
//   }
//   next();
// });

// // Virtual para verificar disponibilidad
// productSchema.virtual('isAvailable').get(function() {
//   return this.isActive && this.stock > 0;
// });

// // Configurar virtuals en JSON
// productSchema.set('toJSON', { virtuals: true });
// productSchema.set('toObject', { virtuals: true });

// // Índices para mejorar búsquedas
// productSchema.index({ name: 'text', description: 'text' });
// productSchema.index({ brand: 1 });
// productSchema.index({ category: 1 });
// productSchema.index({ price: 1 });
// productSchema.index({ slug: 1 });
// productSchema.index({ sku: 1 });

// const ProductModel = mongoose.model('Product', productSchema);

// export default ProductModel