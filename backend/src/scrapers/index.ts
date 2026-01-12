// src/scrapers/index.ts
import BrandModel from "../models/Brand";
import Product from "../models/Product";
import stores from "./core/brands"
import { IProduct } from "../models/Product";

export async function saveOrUpdateProduct(product: IProduct) {
  await Product.updateOne(
    { url: product.url },      // filtro para identificar el producto
    {
      $set: {
        brand: product.brand,
        title: product.title,

        price: product.price,
        currency: product.currency ?? null,
        inStock: product.inStock ?? null,
        isActive: product.isActive ?? null,
        
        images: product.images ?? null,
        
        category: product.category ?? "otros",
        categoryConfidence : product.categoryConfidence ?? 0,

        tags : product.tags ?? [],
        
        variants: product.variants ?? null,
        
        scrapedAt: new Date(),
        raw: product.raw ?? null
      }
    },
    { upsert: true }
  );
}

const runScraperFor = async (storeKey: string) => {
  const store = stores[storeKey];
  if (!store) throw new Error("Store no registrada: " + storeKey);

  const scrapedItems  = await store.scrape();

  
  const brand = await BrandModel.findOne({ name: store.name })
  
  console.log(brand)

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
      
      variants: item.variants ?? null,


      images: item.images ?? null,
      
      
      scrapedAt: new Date(),
      raw: item.raw ?? null
    } as IProduct);

    updated++;
  }

  // Guardar en BD (ejemplo simple: inserta todos sin chequeos)
  // const docs = items.map((it: any) => ({
  //   brand: brand?._id,
  //   title: it.title,
  //   price: it.price,
  //   currency: it.currency ?? null,
  //   url: it.url,
  //   images: it.image ?? [],
  //   inStock: it.inStock ?? null,
  //   scrapedAt: new Date(),
  //   raw: it.raw ?? null
  // }));
  
  // Puedes optar por upsert por URL; aquí haremos insertMany simple:
  if (updated === 0) return { ok: true, count: 0 };
  
  // await Product.insertMany(docs);
  
  return { ok: true, count: updated };
}

export default runScraperFor
