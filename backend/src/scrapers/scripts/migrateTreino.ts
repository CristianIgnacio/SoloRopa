import dotenv from "dotenv";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import axios from "axios";
import Brand from "../../models/Brand";
import Product from "../../models/Product";
import { Treinoficial } from "../brands/treinoficial";
import { planTreinoMigration } from "../treinoMigrationPlan";

dotenv.config({ quiet: true });
const EJSON = mongoose.mongo.BSON.EJSON;
const apply = process.argv.includes("--apply");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Falta MONGODB_URI para la migración de producción");
  if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(","));
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DBNAME || "SoloRopa",
    serverSelectionTimeoutMS: 15000,
    autoIndex: false,
    autoCreate: false,
  });
  const brand = await Brand.findOne({ slug: "treinoficial" }).lean();
  if (!brand) throw new Error("No existe la marca Treinoficial");
  const existing = await Product.find({ brand: brand._id }).sort({ _id: 1 }).lean();
  const catalog = await Treinoficial.scrape();
  for (const p of catalog) {
    if (!p.raw?.id || !p.images?.length || !Number.isFinite(p.price)
      || new URL(p.url).hostname !== "treino.cl"
      || p.images.some(i => new URL(i.src).hostname !== "cdn.shopify.com")) {
      throw new Error(`Producto inválido para migrar: ${p.title}`);
    }
  }
  // Comprobar que el CDN entrega una imagen, no sólo HTTP 200.
  const image = await axios.get(catalog[0].images![0].src, { timeout: 15000, responseType: "arraybuffer" });
  if (!String(image.headers["content-type"]).startsWith("image/")) throw new Error("El CDN no devolvió una imagen");

  const plan = planTreinoMigration(existing, catalog);
  const summary = {
    mode: apply ? "apply" : "dry-run", existing: existing.length, catalog: catalog.length,
    matched: plan.matched.length, added: plan.added.length, retired: plan.retired.length,
    available: catalog.filter(p => p.inStock).length,
  };
  const folder = path.resolve("uploads/treino-migration");
  fs.mkdirSync(folder, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(folder, `plan-${stamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({ summary,
    matched: plan.matched.map(m => ({ id: String(m.existing._id), from: m.existing.title, to: m.product.title, url: m.product.url, reason: m.reason })),
    retired: plan.retired.map(p => ({ id: String(p._id), title: p.title })),
    added: plan.added.map(p => ({ title: p.title, url: p.url })),
  }, null, 2));
  console.log(JSON.stringify({ ...summary, reportPath }));
  if (!apply) return;

  const fields = (p: typeof catalog[number]) => ({
    brand: brand._id, title: p.title, url: p.url, price: p.price, currency: "CLP",
    images: p.images, inStock: p.inStock, isActive: p.isActive, variants: p.variants,
    category: p.category, categoryConfidence: p.categoryConfidence, gender: p.gender,
    tags: p.tags, canonicalTags: p.canonicalTags, raw: p.raw, scrapedAt: new Date(),
  });
  const newDocuments = plan.added.map(p => new Product(fields(p)).toObject());
  for (const p of newDocuments) await new Product(p).validate();
  const backupPath = path.join(folder, `backup-${stamp}.json`);
  fs.writeFileSync(backupPath, EJSON.stringify({ brand, products: existing,
    insertedIds: newDocuments.map(p => p._id), reportPath }, undefined, 2, { relaxed: false }), { flag: "wx" });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Product.find({ brand: brand._id }).sort({ _id: 1 }).session(session).lean();
      const currentBrand = await Brand.findById(brand._id).session(session).lean();
      if (EJSON.stringify(current) !== EJSON.stringify(existing)
        || EJSON.stringify(currentBrand) !== EJSON.stringify(brand)) {
        throw new Error("Los datos cambiaron durante la preparación. Repite la migración");
      }
      for (const m of plan.matched) {
        await Product.updateOne({ _id: m.existing._id, brand: brand._id }, { $set: fields(m.product) }, { session, runValidators: true });
      }
      for (const p of plan.retired) {
        await Product.updateOne({ _id: p._id, brand: brand._id }, { $set: {
          inStock: false, isActive: false, images: [],
          variants: (p.variants || []).map(v => ({ ...v, inStock: false })),
        } }, { session, runValidators: true });
      }
      if (newDocuments.length) await Product.insertMany(newDocuments, { session });
      await Brand.updateOne({ _id: brand._id }, { $set: { website: "https://treino.cl/" } }, { session });

      const saved = await Product.find({ brand: brand._id }).session(session).lean();
      const byId = new Map(saved.map(p => [String(p._id), p]));
      for (const old of existing) {
        const p = byId.get(String(old._id));
        if (!p) throw new Error("Se perdió un ID original");
        for (const key of ["viewsCount", "favoritesCount", "clicksCount", "trendingScore"] as const) {
          if (p[key] !== old[key]) throw new Error(`Se alteró la métrica ${key}`);
        }
      }
      if (saved.length !== existing.length + newDocuments.length) throw new Error("Total inesperado");
      for (const p of catalog) {
        const found = saved.filter(s => s.url === p.url);
        if (found.length !== 1 || found[0].images[0]?.src !== p.images![0].src) {
          throw new Error(`Catálogo inconsistente: ${p.title}`);
        }
      }
    });
    console.log(JSON.stringify({ applied: true, backupPath, ...summary }));
  } finally { await session.endSession(); }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Error de migración");
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
