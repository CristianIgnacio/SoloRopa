import { model, Schema, Types } from "mongoose"

// Cola de avisos de bajada de precio. El scrape crea filas "pending" y el envío diario
// (services/priceAlerts) las junta en un correo por usuario. Ver docs/PRICE_ALERTS.md.
export const PRICE_ALERT_STATUSES = ["pending", "sent", "failed", "skipped"] as const;
export type PriceAlertStatus = typeof PRICE_ALERT_STATUSES[number];

export interface IPriceAlert {
  user: Types.ObjectId;
  product: Types.ObjectId;
  oldPrice: number;
  newPrice: number;
  currency?: string | null;
  status: PriceAlertStatus;
  skipReason?: string;
  attempts: number;
  lastError?: string;
  createdAt: Date;
  sentAt?: Date;
}

const PriceAlertSchema = new Schema<IPriceAlert>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  oldPrice: { type: Number, required: true },
  newPrice: { type: Number, required: true },
  currency: { type: String, required: false },
  status: { type: String, enum: PRICE_ALERT_STATUSES, default: "pending", required: true },
  skipReason: { type: String, required: false },
  attempts: { type: Number, default: 0 },
  lastError: { type: String, required: false },
  createdAt: { type: Date, default: () => new Date(), required: true },
  sentAt: { type: Date, required: false },
}, {
  versionKey: false,
});

// No duplicar un aviso pendiente si el mismo cambio se detecta dos veces (admin + cron).
PriceAlertSchema.index(
  { user: 1, product: 1, newPrice: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
// Último aviso enviado a un usuario por un producto ("solo avisar si baja de ese precio").
PriceAlertSchema.index({ user: 1, product: 1, sentAt: -1 });
// Envío diario: pendientes y fallidas por fecha.
PriceAlertSchema.index({ status: 1, createdAt: 1 });

const PriceAlertModel = model<IPriceAlert>("PriceAlert", PriceAlertSchema);

export default PriceAlertModel
