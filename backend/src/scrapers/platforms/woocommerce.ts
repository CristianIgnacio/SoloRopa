import axios from "axios";
import { IProduct } from "../../models/Product";
// import * as cheerio from "cheerio";
import { processProduct } from "../tag-engine";
import { wooToRawProduct } from "../adapters/wooToRawProduct";

export interface WooCommerceProduct extends Partial<IProduct> {
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  image?: string | null;
  inStock?: boolean;
  raw?: any;
}

/**
 * Intentamos:
 * 1) fetch {base}/products.json (si existe)
 * 2) si 1 falla, hacemos scraping de /collections/all o /collections/{handle}?view=all
 */
const scrapeWooCommerceBase = async (baseUrl: string): Promise<WooCommerceProduct[]> => {
  const perPage = 50
  let page = 1
  const allProducts: WooCommerceProduct[] = [];

  console.log(`🛍️ Iniciando scraping Woocommerce: ${baseUrl}`);

  while(true){

    const url = `${baseUrl}/wp-json/wc/store/products?per_page=${perPage}&page=${page}`;

    
    console.log(`📄 Página ${page}: ${url}`);

    try {
      const apiUrl = new URL(url, baseUrl).toString();
      const { data } = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (scraper)" },
        timeout: 15000
      });

      const products: WooCommerceProduct[] = data || [];

      if (products.length === 0) {
        console.log("✔ No hay más productos. Fin del scraping.");
        break;
      }

      if (products) {
        for (const p of data) {
          const price = p.prices.price ? Number(p.prices.price) : null;
          
          const img = p?.images?.src 
            ?? (p?.images?.map( (i : any) => {
                return { src : i.src, alt : p.alt} 
              }) 
                ?? []);

          const tags = p.categories.map( (c : any) => c.name.toLowerCase())

          const category = tags[0]

          const rawProduct = wooToRawProduct(p, baseUrl);
          const normalized = processProduct(rawProduct);
          
          const tallasNombre = ["size", "talla", "tallas"];
          const colorNombre = ["color", "colour", "colores"];
          
          let sizeTerms: any[] = [];
          let colorTerms: any[] = [];

          for (const attr of p.attributes ?? []) {
             const nameLower = attr.name.toLowerCase();
             if (tallasNombre.includes(nameLower)) {
                 sizeTerms = attr.terms ?? [];
             } else if (colorNombre.includes(nameLower)) {
                 colorTerms = attr.terms ?? [];
             }
          }

          const variantsMap = new Map(); // "colorSlug-sizeSlug" -> variantObj
          const defaultPrice = p.prices?.price ? Number(p.prices.price) : null;

          // Generate combinations
          if (colorTerms.length > 0 && sizeTerms.length > 0) {
              for (const c of colorTerms) {
                  for (const s of sizeTerms) {
                      const key = `${c.slug}-${s.slug}`;
                      variantsMap.set(key, { title: `${c.name} / ${s.name}`, inStock: false, color: c.name, size: s.name, price: defaultPrice });
                  }
              }
          } else if (colorTerms.length > 0) {
              for (const c of colorTerms) {
                  variantsMap.set(`${c.slug}-`, { title: c.name, inStock: false, color: c.name, price: defaultPrice });
              }
          } else if (sizeTerms.length > 0) {
              for (const s of sizeTerms) {
                  variantsMap.set(`-${s.slug}`, { title: s.name, inStock: false, size: s.name, price: defaultPrice });
              }
          } else {
              // No color or size variations
              variantsMap.set(`-`, { title: "Default Title", inStock: p.is_in_stock ?? false, price: defaultPrice });
          }

          // Now validate against variations to activate inStock
          for (const v of p.variations ?? []) {
              let vColorSlug = "";
              let vSizeSlug = "";

              for (const attr of v.attributes ?? []) {
                  const nameLower = attr.name.toLowerCase();
                  if (tallasNombre.includes(nameLower)) {
                      vSizeSlug = attr.value;
                  } else if (colorNombre.includes(nameLower)) {
                      vColorSlug = attr.value;
                  }
              }

              const key = `${vColorSlug}-${vSizeSlug}`;
              const variant = variantsMap.get(key);
              
              if (variant) {
                  variant.inStock = true;
                  if (v.price !== undefined) variant.price = Number(v.price);
                  if (v.compare_at_price !== undefined) variant.comparePrice = Number(v.compare_at_price);
                  if (v.sku) variant.sku = v.sku;
              } else {
                // Se agrega dinámicamente si no existía globalmente
                variantsMap.set(key, {
                    title: [vColorSlug, vSizeSlug].filter(Boolean).join(" / "),
                    inStock: true,
                    color: vColorSlug || undefined,
                    size: vSizeSlug || undefined,
                    price: v.price !== undefined ? Number(v.price) : defaultPrice,
                    sku: v.sku || undefined
                });
              }
          }

          const variants = Array.from(variantsMap.values());

          allProducts.push({
            title: p.name,
            url: p.permalink,

            price,
            currency: p?.prices.currency_code || null,
            inStock: p.is_in_stock || false,
            isActive : p.is_in_stock || false,

            // category : category,
            category: normalized.tags.category,
            categoryConfidence : category ? 0.9 : 0.3,
            
            tags : tags,
            canonicalTags: normalized.tags,
            
            images: img,

            variants,

            raw: p
          });
        }
      }

      await new Promise((r) => setTimeout(r, 500));
      page++; // siguiente página

    } catch (err) {
        console.error(`❌ Error scraping página ${page}:`, err);
        break

      // break;
    }
  }
  console.log(`✨ Total productos encontrados: ${allProducts.length}`);
  return allProducts;

}

export default scrapeWooCommerceBase