import axios from "axios";
import { IProduct } from "../../models/Product";
// import * as cheerio from "cheerio";

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
          
          const tallasNombre = ["size", "talla"]
          const sizeMap = new Map<string, {
            title: string;
            sku?: string;
            price?: number;
            comparePrice?: number;
            inStock: boolean;
          }>();

          for (const attr of p.attributes ?? []) {
            if (!tallasNombre.includes(attr.name.toLowerCase())) continue;

            for (const term of attr.terms ?? []) {
              const key = term.name.toLowerCase();

              sizeMap.set(key, {
                title: term.name,
                sku: term.slug,
                inStock: false,
              });
            }
          }

          for (const v of p.variations ?? []) {
            for (const attr of v.attributes ?? []) {
              if (!tallasNombre.includes(attr.name.toLowerCase())) continue;

              const key = attr.value.toLowerCase();
              const size = sizeMap.get(key);
              if (!size) continue;

              // Regla estándar: si existe variación → hay stock
              size.inStock = true;

              if (v.price !== undefined) {
                size.price = Number(v.price);
              }
              if (v.compare_at_price !== undefined) {
                size.comparePrice = Number(v.compare_at_price);
              }
            }
          }

          const variants = Array.from(sizeMap.values());

          allProducts.push({
            title: p.name,
            url: p.permalink,

            price,
            currency: p?.prices.currency_code || null,
            inStock: p.is_in_stock || false,
            isActive : p.is_in_stock || false,

            category : category,
            categoryConfidence : category ? 0.9 : 0.3,

            tags : tags,
            
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
      // console.warn("products.json no disponible:", err.message);

      // break;
    }

  }

  console.log(`✨ Total productos encontrados: ${allProducts.length}`);
  return allProducts;

}

export default scrapeWooCommerceBase