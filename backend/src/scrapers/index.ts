// src/scrapers/index.ts
import BrandModel from "../models/Brand";
import Product from "../models/Product";
import stores from "./core/brands"
import { IProduct } from "../models/Product";
import type { UpsertProductInput } from "./types"

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

  if (input.images !== undefined) $set.images = input.images ?? [];
  if (input.category !== undefined) $set.category = input.category;
  if (input.categoryConfidence !== undefined) $set.categoryConfidence = input.categoryConfidence;

  if (input.tags !== undefined) $set.tags = input.tags ?? [];
  if (input.variants !== undefined) $set.variants = input.variants ?? [];

  // 🔥 nuevo sistema
  if (input.canonicalTags !== undefined) $set.canonicalTags = input.canonicalTags ?? {};

  if (input.raw !== undefined) $set.raw = input.raw;

  return $set;
};

export async function saveOrUpdateProduct(input: UpsertProductInput) {
  if (!input.url) throw new Error("Product sin url");

  const $set = buildSet(input);

  await Product.updateOne(
    { url: input.url },
    { $set },
    { upsert: true }
  );
}

const runScraperFor = async (storeKey: string) => {
  const store = stores[storeKey];
  if (!store) throw new Error("Store no registrada: " + storeKey);

  const scrapedItems  = await store.scrape();
  console.log("Store.name : ", store.name)
  const brand = await BrandModel.findOne({ name: store.name })
  console.log("Brand : " + brand)
  if (!brand) throw new Error(`Brand no existe en BD: ${store.name}`);

  let updated = 0;
  for (const item of scrapedItems) {
    await saveOrUpdateProduct({
      title: item.title,
      brand: brand?.id,
      url: item.url,

      price: item.price,
      currency: item.currency ?? null,
      inStock: item.inStock ?? null,
      isActive: item.isActive ?? null,
      
      category: item.category ?? "otros",
      categoryConfidence : item.categoryConfidence ?? 0,

      tags : item.tags ?? [],
      canonicalTags: item.canonicalTags,
      
      variants: item.variants ?? null,

      images: item.images ?? null,
            
      raw: item.raw ?? null
    });

    updated++;
  }
  
  // Puedes optar por upsert por URL; aquí haremos insertMany simple:
  if (updated === 0) return { ok: true, count: 0 };
  
  // await Product.insertMany(docs);
  
  return { ok: true, count: updated };
}

export default runScraperFor
