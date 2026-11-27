// src/scrapers/index.ts
import mongoose from "mongoose";
import BrandModel from "../models/Brand";
import Product from "../models/Product";
import PriceHistory from "../models/PriceHistory";
import stores from "./core/brands"
import type { UpsertProductInput } from "./types"
import { getTrackedPrice, hasPriceChanged } from "../utils/priceTracking";

export type PriceChange = {
  productId: mongoose.Types.ObjectId;
  previousPrice: number | null; // null = producto nuevo o que antes no tenía precio
  newPrice: number;
  currency: string | null;
};

const buildSet = (input: UpsertProductInput) => {
  const $set: Record<string, any> = {
    scrapedAt: new Date(),
  };

  // solo setear si viene definido (no pisar con undefined)
  if (input.brand) $set.brand = input.brand;
  if (input.title !== undefined) $set.title = input.title;

  if (input.price !== undefined) $set.price = input.price;
  if (input.currency !== undefined) $set.currency = input.currency;
  if (input.inStock !== undefined) $set.inStock = input.inStock;
  if (input.isActive !== undefined) $set.isActive = input.isActive;

  // Una extracción incompleta no debe borrar las imágenes ya guardadas.
  if (input.images?.length) $set.images = input.images;
  if (input.category !== undefined) $set.category = input.category;
  if (input.categoryConfidence !== undefined) $set.categoryConfidence = input.categoryConfidence;
  if (input.gender !== undefined) $set.gender = input.gender;

  if (input.tags !== undefined) $set.tags = input.tags ?? [];
  if (input.variants !== undefined) $set.variants = input.variants ?? [];

  // 🔥 nuevo sistema
  if (input.canonicalTags !== undefined) $set.canonicalTags = input.canonicalTags ?? {};

  if (input.raw !== undefined) $set.raw = input.raw;

  return $set;
};

export async function saveOrUpdateProduct(input: UpsertProductInput): Promise<PriceChange | null> {
  if (!input.url) throw new Error("Product sin url");

  const $set = buildSet(input);

  // returnDocument "before" trae el precio anterior en la misma consulta que actualiza.
  const result = await Product.findOneAndUpdate(
    { url: input.url },
    { $set },
    {
      upsert: true,
      returnDocument: "before",
      projection: { price: 1, variants: 1, currency: 1, scrapedAt: 1 },
      includeResultMetadata: true,
      lean: true,
    }
  );

  const previous = result.value;
  const productId = (previous?._id ?? result.lastErrorObject?.upserted) as mongoose.Types.ObjectId | undefined;
  if (!productId) return null;

  // Estado que quedó guardado: buildSet no pisa los campos que vienen undefined.
  const nextPrice = input.price !== undefined ? input.price : previous?.price;
  const nextVariants = input.variants !== undefined ? input.variants ?? [] : previous?.variants;

  const previousTracked = previous ? getTrackedPrice(previous.variants, previous.price) : null;
  const nextTracked = getTrackedPrice(nextVariants, nextPrice);
  if (!nextTracked || !hasPriceChanged(previousTracked, nextTracked)) return null;

  const now = new Date();
  const currency = input.currency ?? previous?.currency ?? null;
  const rows = [];

  // Producto que existía antes del historial y aún no tiene filas: guardar también el precio
  // anterior, si no el primer cambio quedaría sin un "antes" con qué compararlo.
  if (previousTracked && !(await PriceHistory.exists({ product: productId }))) {
    rows.push({ product: productId, ...previousTracked, currency, recordedAt: previous?.scrapedAt ?? now });
  }
  rows.push({ product: productId, ...nextTracked, currency, recordedAt: now });
  await PriceHistory.insertMany(rows);

  return {
    productId,
    previousPrice: previousTracked?.price ?? null,
    newPrice: nextTracked.price,
    currency,
  };
}

const runScraperFor = async (storeKey: string) => {
  const store = stores[storeKey];
  if (!store) throw new Error("Store no registrada: " + storeKey);

  const scrapedItems  = await store.scrape();
  if (!scrapedItems.length) {
    throw new Error(`Catálogo vacío para ${store.name}; no se actualizaron productos`);
  }
  console.log("Store.name : ", store.name)
  const brand = await BrandModel.findOne({ name: store.name })
  console.log("Brand : " + brand)
  if (!brand) throw new Error(`Brand no existe en BD: ${store.name}`);

  let updated = 0;
  let priceChanges = 0;
  for (const item of scrapedItems) {
    const change = await saveOrUpdateProduct({
      title: item.title,
      brand: brand?.id,
      url: item.url,

      price: item.price,
      currency: item.currency ?? null,
      inStock: item.inStock ?? null,
      isActive: item.isActive ?? null,
      
      category: item.category ?? "otros",
      categoryConfidence : item.categoryConfidence ?? 0,
      gender: item.gender,

      tags : item.tags ?? [],
      canonicalTags: item.canonicalTags,
      
      variants: item.variants ?? null,

      images: item.images ?? null,
            
      raw: item.raw ?? null
    });

    // Solo cuenta productos que ya tenían precio; los nuevos solo abren su historial.
    if (change && change.previousPrice !== null) priceChanges++;
    updated++;
  }

  // Puedes optar por upsert por URL; aquí haremos insertMany simple:
  if (updated === 0) return { ok: true, count: 0, priceChanges: 0 };
  
  // await Product.insertMany(docs);
  
  return { ok: true, count: updated, priceChanges };
}

export default runScraperFor
