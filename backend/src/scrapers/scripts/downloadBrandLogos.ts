import dotenv from "dotenv";
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";
import axios from "axios";
import sharp from "sharp";
import Brand from "../../models/Brand";

dotenv.config({ quiet: true });
const root = path.resolve(__dirname, "../../../..");
// Treino dejó Jumpseller; el origen antiguo de MongoDB ya no está disponible.
const sourceOverrides: Record<string, string> = {
  treinoficial: "https://treino.cl/cdn/shop/files/LOGO-OK_190x.gif?v=1777048305",
};
const extensions: Record<string, string> = {
  jpeg: "jpg", png: "png", webp: "webp", gif: "gif", svg: "svg", avif: "avif",
};

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI");
  if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(","));
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DBNAME || "SoloRopa", serverSelectionTimeoutMS: 15000,
    autoIndex: false, autoCreate: false,
  });
  const brands = await Brand.find({}).sort({ slug: 1 }).lean();
  if (!brands.length) throw new Error("No hay marcas para descargar");
  const downloads: { slug: string; name: string; source: string; src: string; buffer: Buffer;
    backgroundColor: string; width?: number; height?: number; format: string }[] = [];
  for (let offset = 0; offset < brands.length; offset += 4) {
    const batch = await Promise.all(brands.slice(offset, offset + 4).map(async brand => {
      const slug = String(brand.slug);
      if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Slug inválido: ${slug}`);
      const source = sourceOverrides[slug] || String(brand.logo?.src || "");
      if (!source.startsWith("https://")) throw new Error(`Falta origen HTTPS para ${slug}`);
      try {
        const response = await axios.get(source, {
          timeout: 20000, responseType: "arraybuffer", maxContentLength: 10 * 1024 * 1024,
        });
        const buffer = Buffer.from(response.data);
        const metadata = await sharp(buffer).metadata();
        const format = metadata.format || "";
        const extension = extensions[format];
        if (!extension || !metadata.width || !metadata.height) throw new Error("No es una imagen válida");
        // El SVG debe funcionar sin recursos de otra web.
        if (format === "svg" && /(?:href\s*=\s*["'](?:https?:)?\/\/|url\(\s*["']?(?:https?:)?\/\/)/i.test(buffer.toString())) {
          throw new Error("El SVG contiene recursos externos");
        }
        console.log(`${slug}: ${format}, ${metadata.width}x${metadata.height}, ${buffer.length} bytes`);
        return { slug, name: String(brand.name), source, src: `/brands/${slug}.${extension}`, buffer,
          backgroundColor: String(brand.logo?.backgroundColor || "#ffffff"),
          width: metadata.width, height: metadata.height, format };
      } catch (error) {
        const detail = axios.isAxiosError(error) ? `HTTP ${error.response?.status || error.code}`
          : error instanceof Error ? error.message : "Error desconocido";
        throw new Error(`No se pudo descargar ${slug}: ${detail}`);
      }
    }));
    downloads.push(...batch);
  }
  // No reemplazar archivos ni el manifiesto hasta validar todas las descargas.
  const folder = path.join(root, "frontend/public/brands");
  fs.mkdirSync(folder, { recursive: true });
  for (const image of downloads) fs.writeFileSync(path.join(folder, path.basename(image.src)), image.buffer);
  const manifest = Object.fromEntries(downloads.map(p => [p.slug, p.src]));
  fs.mkdirSync(path.join(root, "frontend/src/data"), { recursive: true });
  fs.writeFileSync(path.join(root, "frontend/src/data/brandLogos.ts"),
    `// Archivos locales verificados por downloadBrandLogos.ts\nexport const localBrandLogos: Record<string, string> = ${JSON.stringify(manifest, null, 2)}\n`);
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/brand-logo-sources.json"), JSON.stringify({
    downloadedAt: new Date().toISOString(), brands: downloads.map(({ buffer, ...p }) => ({
      ...p, bytes: buffer.length, sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
    })),
  }, null, 2) + "\n");
  console.log(JSON.stringify({ downloaded: downloads.length, folder }));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Error al descargar logos");
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
