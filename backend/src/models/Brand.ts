import mongoose from "mongoose";

interface IBrand extends Document {
  name : String,
  slug : String,
  description : String,
  logo : {
    src: String, // URL de la imagen del logo
    alt?: String
    backgroundColor?: String
  },
  website : String,
  isActive : boolean
}

const brandSchema = new mongoose.Schema<IBrand>({
  name: {
    type: String,
    required: [true, 'El nombre de la marca es requerido'],
    unique: true,
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  logo: {
    src: { type: String, required: true },
    alt: { type: String, default: ''},
    backgroundColor: {type: String, default: '#FFFFFF'}
  },
  website: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Middleware para generar el slug antes de guardar
brandSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Índices para mejorar búsquedas
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 });

brandSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const BrandModel = mongoose.model('Brand', brandSchema);

export default BrandModel