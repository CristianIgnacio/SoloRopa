import mongoose, { model, Schema, Types } from "mongoose"

// Una fila por cada cambio del precio "desde" de un producto (ver utils/priceTracking).
// Si el precio no cambia entre scrapes, no se agrega nada.
export interface IPriceHistory {
  product: Types.ObjectId;
  price: number;
  comparePrice?: number | null;
  currency?: string | null;
  recordedAt: Date;
}

const PriceHistorySchema = new Schema<IPriceHistory>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number, required: false },
  currency: { type: String, required: false },
  recordedAt: { type: Date, required: true, default: () => new Date() },
}, {
  versionKey: false, // las filas no se editan después de insertarse
});

// Cubre "historial de un producto, más reciente primero" y "último registro antes de una fecha".
PriceHistorySchema.index({ product: 1, recordedAt: -1 });

PriceHistorySchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const PriceHistoryModel = model<IPriceHistory>("PriceHistory", PriceHistorySchema);

export default PriceHistoryModel
