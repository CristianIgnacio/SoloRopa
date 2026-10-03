import axios from "axios";
import { IProduct } from "../../models/Product";
import { normalizeProductMetadata } from "../tag-engine";
import type { CanonicalTags } from "../domain/Tag";
import { Gender } from "../domain/enums";

export interface WooCommerceProduct extends Partial<IProduct> {
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  image?: string | null;
  images?: { src: string; alt?: string }[];
  inStock?: boolean;
  isActive?: boolean;
  variants?: { title: string; inStock?: boolean; price?: number }[];
  canonicalTags?: CanonicalTags;
  gender?: Gender;
  categoryConfidence?: number;
  raw?: any;
}

/**
 * Lee el catálogo público paginado de WooCommerce Store API.
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
      const { data, headers } = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (scraper)" },
        timeout: 15000
      });

      if (!Array.isArray(data)) {
        throw new Error("WooCommerce no devolvió una lista de productos");
      }
      const products = data;

      if (products.length === 0) {
        console.log("✔ No hay más productos. Fin del scraping.");
        break;
      }

      if (products) {
        for (const p of data) {
          const price = p.prices.price ? Number(p.prices.price) : null;
          
          const img = p?.images?.src 
            ?? (p?.images?.map( (i : any) => {
                return { src : i.src, alt : i.alt}
              }) 
                ?? []);

          const rawTags = p.categories ? p.categories.map((c: any) => c.slug.toLowerCase()) : [];

          let description = "";
          if (p.description) description += p.description;
          if (p.short_description) description += " " + p.short_description;

          const normalized = normalizeProductMetadata(p.name, rawTags, description);
          
          const tallasNombre = ["size", "talla", "tallas"];
          const colorNombre = ["color", "colour", "colores"];
          
          let sizeTerms: any[] = [];
          let colorTerms: any[] = [];
          let fixedSizeSlug = "";
          let fixedColorSlug = "";

          for (const attr of p.attributes ?? []) {
             const nameLower = attr.name.toLowerCase();
             // Un color descriptivo (p. ej. Beige + Negro) no es una opción
             // de compra. Mantenerlo unido evita inventar combinaciones.
             const terms = attr.has_variations === false && attr.terms?.length
               ? [{
                   slug: attr.terms.map((t: any) => t.slug).join("-"),
                   name: attr.terms.map((t: any) => t.name).join(" / ")
                 }]
               : attr.terms ?? [];
             if (tallasNombre.includes(nameLower)) {
                 sizeTerms = terms;
                 if (attr.has_variations === false) fixedSizeSlug = terms[0]?.slug ?? "";
             } else if (colorNombre.includes(nameLower)) {
                 colorTerms = terms;
                 if (attr.has_variations === false) fixedColorSlug = terms[0]?.slug ?? "";
             }
          }

          const variantsMap = new Map(); // "colorSlug-sizeSlug" -> variantObj
          const defaultPrice = p.prices?.price ? Number(p.prices.price) : null;
          const initialStock = p.type === "simple" && (p.is_in_stock ?? false);

          // Generate combinations
          if (colorTerms.length > 0 && sizeTerms.length > 0) {
              for (const c of colorTerms) {
                  for (const s of sizeTerms) {
                      const key = `${c.slug}-${s.slug}`;
                      variantsMap.set(key, { title: `${c.name} / ${s.name}`, inStock: initialStock, color: c.name, size: s.name, price: defaultPrice });
                  }
              }
          } else if (colorTerms.length > 0) {
              for (const c of colorTerms) {
                  variantsMap.set(`${c.slug}-`, { title: c.name, inStock: initialStock, color: c.name, price: defaultPrice });
              }
          } else if (sizeTerms.length > 0) {
              for (const s of sizeTerms) {
                  variantsMap.set(`-${s.slug}`, { title: s.name, inStock: initialStock, size: s.name, price: defaultPrice });
              }
          } else {
              // No color or size variations
              variantsMap.set(`-`, { title: "Default Title", inStock: p.is_in_stock ?? false, price: defaultPrice });
          }

          // Now validate against variations to activate inStock
          for (const v of p.variations ?? []) {
              let vColorSlug = fixedColorSlug;
              let vSizeSlug = fixedSizeSlug;

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
                  // El listado puede omitir el stock por talla; no inventarlo.
                  variant.inStock = p.is_in_stock === false ? false : v.is_in_stock;
                  if (v.price !== undefined) variant.price = Number(v.price);
                  if (v.compare_at_price !== undefined) variant.comparePrice = Number(v.compare_at_price);
                  if (v.sku) variant.sku = v.sku;
              } else {
                // Se agrega dinámicamente si no existía globalmente
                variantsMap.set(key, {
                    title: [vColorSlug, vSizeSlug].filter(Boolean).join(" / "),
                    inStock: p.is_in_stock === false ? false : v.is_in_stock,
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

            category: normalized.category,
            categoryConfidence: normalized.categoryConfidence,
            gender: normalized.gender,
            
            tags: normalized.tags,
            canonicalTags: normalized.canonicalTags,
            
            images: img,

            variants,

            raw: p
          });
        }
      }

      const totalPages = Number(headers["x-wp-totalpages"]);
      if (products.length < perPage || (totalPages > 0 && page >= totalPages)) break;

      await new Promise((r) => setTimeout(r, 500));
      page++; // siguiente página

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`Error WooCommerce en ${baseUrl}, página ${page}: ${message}`);
    }
  }
  console.log(`✨ Total productos encontrados: ${allProducts.length}`);
  return allProducts;

}

export default scrapeWooCommerceBase
