import mongoose, { Document } from 'mongoose';

interface IWishlistItem extends Document {
  productId: mongoose.Schema.Types.ObjectId;       // Relación al producto
  addedAt: Date;
  note?: string;           // “Se ve bueno en color negro”
  tags?: string[];         // “oversize”, “streetwear”
}

interface IWishlist extends Document {
  userId: mongoose.Schema.Types.ObjectId;  
  name: string;
  description?: string;
  coverImage?: string;
  items: IWishlistItem[];
  visibility: "private" | "public" | "unlisted";
  isDefault: boolean;
  createdAt: Date;
}

const WishlistItemSchema = new mongoose.Schema<IWishlistItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  addedAt: { type: Date, default: Date.now },
  note: { type: String },
  tags: [{ type: String }]
});

const WishlistSchema = new mongoose.Schema<IWishlist>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    coverImage: { type: String, required: false },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        addedAt: { type: Date, default: () => new Date() },
        note: { type: String, required: false },
        tags: [{ type: String }]
    }],
    visibility: { type: String, enum: ["private", "public", "unlisted"], default: "private" },
    isDefault: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() }
}, {
    timestamps: true
});

// Un usuario no puede tener 2 wishlists con el mismo nombre
WishlistSchema.index({ userId: 1, name: 1 }, { unique: true });

WishlistSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const WishlistModel = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export default WishlistModel;