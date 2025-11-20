// src/scrapers/index.ts
import { Freshbrand } from "./brands/freshbrand";
import Product from "../models/Product";

const stores: { [key: string]: any } = {
  freshbrand: Freshbrand
};

const runScraperFor = async (storeKey: string) => {
  const store = stores[storeKey];
  if (!store) throw new Error("Store no registrada: " + storeKey);
  const items = await store.scrape();
  // Guardar en BD (ejemplo simple: inserta todos sin chequeos)
  const docs = items.map((it: any) => ({
    store: store.name,
    title: it.title,
    price: it.price,
    currency: it.currency ?? null,
    url: it.url,
    image: it.image ?? null,
    inStock: it.inStock ?? null,
    scrapedAt: new Date(),
    raw: it.raw ?? null
  }));
  // Puedes optar por upsert por URL; aquí haremos insertMany simple:
  if (docs.length === 0) return { ok: true, count: 0 };
  await Product.insertMany(docs);
  return { ok: true, count: docs.length };
}

export default runScraperFor
