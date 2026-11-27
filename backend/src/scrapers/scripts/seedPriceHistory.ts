// Crea la fila inicial del historial de precios para los productos que aún no tienen ninguna.
// Así el primer cambio detectado por el scraper ya tiene un "antes" con qué compararse.
//
// npm run price-history:seed              → simulación: solo cuenta las filas que crearía
// npm run price-history:seed -- --apply   → las inserta
//
// Es idempotente: los productos que ya tienen historial se saltan.
import mongoose from "mongoose";
import config from "../../utils/config";
import Product from "../../models/Product";
import PriceHistory from "../../models/PriceHistory";
import { getTrackedPrice } from "../../utils/priceTracking";

const apply = process.argv.includes("--apply");
const BATCH_SIZE = 500;

async function main() {
  if (!config.MONGODB_URI) throw new Error("Falta la URI de MongoDB (MONGODB_URI_LOCAL o MONGODB_URI)");

  await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME });
  const target = process.env.NODE_ENV === "production" || process.env.MONGODB_TARGET === "production" ? "producción" : "local";
  console.log(`Conectado a ${config.MONGODB_DBNAME} (${target})${apply ? "" : " — simulación, usa --apply para escribir"}`);

  const productsWithHistory = await PriceHistory.distinct("product");
  const cursor = Product.find(
    { _id: { $nin: productsWithHistory } },
    { price: 1, variants: 1, currency: 1, scrapedAt: 1 }
  ).lean().cursor();

  const now = new Date();
  let scanned = 0;
  let withoutPrice = 0;
  let inserted = 0;
  let batch: Record<string, unknown>[] = [];

  const flush = async () => {
    if (!batch.length) return;
    if (apply) await PriceHistory.insertMany(batch);
    inserted += batch.length;
    batch = [];
  };

  for await (const product of cursor) {
    scanned++;
    const tracked = getTrackedPrice(product.variants, product.price);
    if (!tracked) {
      withoutPrice++;
      continue;
    }
    // scrapedAt es la última vez que se vio este precio: es lo más honesto que sabemos.
    batch.push({
      product: product._id,
      ...tracked,
      currency: product.currency ?? null,
      recordedAt: product.scrapedAt ?? now,
    });
    if (batch.length >= BATCH_SIZE) await flush();
  }
  await flush();

  console.log(`Productos que ya tenían historial: ${productsWithHistory.length}`);
  console.log(`Productos sin historial revisados: ${scanned}`);
  console.log(`Omitidos por no tener precio válido: ${withoutPrice}`);
  console.log(`${apply ? "Filas insertadas" : "Filas que se insertarían"}: ${inserted}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
