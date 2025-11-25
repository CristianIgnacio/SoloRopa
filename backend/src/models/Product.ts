import { model, Schema, Document } from "mongoose"

export interface IProduct extends Document {
  brand: string;      // e.g., "freshbrand"
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images: { src: string; alt?: string }[];
  inStock?: boolean;
  scrapedAt: Date;
  raw?: any;          // guarda el JSON/HTML bruto si quieres
}

const ProductSchema = new Schema<IProduct>({
  brand: { type: String, required: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: false },
  currency: { type: String, required: false },
  url: { type: String, required: true, unique: false },
  images: [{
    src: {type: String, required: true},
    alt: {type: String, default: ''}
  }],
  inStock: { type: Boolean, required: false },
  scrapedAt: { type: Date, default: () => new Date() },
  raw: { type: Schema.Types.Mixed }
}, { 
  timestamps: true
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