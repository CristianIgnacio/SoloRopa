import axios from "axios";
import { IProduct } from "../../models/Product";
import { ProductCategory } from "../../constants/productCategories";
// import * as cheerio from "cheerio";

export interface ShopifyProduct extends Partial<IProduct> {
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images?: { src: string; alt?: string }[] | [];
  category : ProductCategory;
  tags : string[],
  inStock?: boolean;
  isActive?: boolean;
  variants?: { title: string; sku?: string; price?: number; comparePrice? : number ; inStock?: boolean }[];
  raw?: any;
}

/**
 * Intentamos:
 * 1) fetch {base}/products.json (si existe)
 * 2) si 1 falla, hacemos scraping de /collections/all o /collections/{handle}?view=all
 */
const scrapeShopifyBase = async (baseUrl: string): Promise<ShopifyProduct[]> => {
  const limit = 50
  let page = 1
  const allProducts: ShopifyProduct[] = [];

  console.log(`🛍️ Iniciando scraping Shopify: ${baseUrl}`);

  while(true){

    const url = `${baseUrl}/products.json?limit=${limit}&page=${page}`;
    
    console.log(`📄 Página ${page}: ${url}`);

    // 1) Intentar /products.json
    try {
      const apiUrl = new URL(url, baseUrl).toString();
      const { data } = await axios.get(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (scraper)" },
        timeout: 15000
      });

      const products: ShopifyProduct[] = data?.products || [];

      if (products.length === 0) {
        console.log("✔ No hay más productos. Fin del scraping.");
        break;
      }

      if (data && data.products) {
        for (const p of data.products) {
          const price = p?.variants?.[0]?.price ? Number(p.variants[0].price) : null;
          // const img = p?.image?.src ?? (p?.images?.[0]?.src ?? null);
          
          const img = p?.image?.src 
            ?? (p?.images?.map( (i : any) => {
                return { src : i.src, alt : p.title} 
              }) 
                ?? []);

          const variants = p?.variants?.map( (v : any) => {
            return {
              title: v.option1,
              sku: v.sku,
              price: v.price ? Number(v.price) : undefined,
              comparePrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
              inStock: v.available
            }
          }) ?? [];

          const isActive = variants.some( (v : any) => v.inStock );

          const category = p.product_type || "otros"

          const tags = p.tags || []
                
          allProducts.push({
            title: p.title,
            url: new URL(`/products/${p.handle}`, baseUrl).toString(),

            price,
            currency: p?.variants?.[0]?.currency || null,
            inStock: p?.variants?.some((v: any) => v?.available) ?? undefined,
            isActive,
            
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
      // console.warn("products.json no disponible:", err.message);

      // console.error(`❌ Error scraping página ${page}:`, err.message);
      // break;
    }

  }

  console.log(`✨ Total productos encontrados: ${allProducts.length}`);
  return allProducts;


  // // 2) Fallback a scraping HTML de colección
  // try {
  //   const collectionUrlCandidates = ["/collections/all", "/collections/all?page=1"];
  //   let html: string | null = null;
  //   for (const path of collectionUrlCandidates) {
  //     try {
  //       const full = new URL(path, baseUrl).toString();
  //       const res = await axios.get(full, { timeout: 15000, headers: {"User-Agent":"Mozilla/5.0"}});
  //       if (res.data && typeof res.data === "string" && res.data.length > 500) {
  //         html = res.data;
  //         break;
  //       }
  //     } catch(e) { /* seguir */ }
  //   }
  //   if (!html) return allProducts;
  //   const $ = cheerio.load(html);

  //   // Selector genérico: tarjetas de producto (ajusta si no coincide)
  //   const productElems = $("a[href*='/products/']");
  //   productElems.each((_, el) => {
  //     const a = $(el);
  //     const title = a.find("img[alt]").attr("alt") || a.find(".product-title, .card__title, .product-card__title").text().trim();
  //     const href = a.attr("href") || "";
  //     const img = a.find("img").attr("src") || a.find("img").attr("data-src") || null;
  //     let priceText = a.find(".price, .product-card__price, .price-item").text().trim();
  //     let price = null;
  //     if (priceText) {
  //       const m = priceText.replace(/\./g, "").match(/(\d+\,?\d*)/);
  //       if (m) price = Number(m[1].replace(",", "."));
  //     }
  //     if (href && title) {
  //       allProducts.push({
  //         title,
  //         price,
  //         url: new URL(href, baseUrl).toString(),
  //         image: img,
  //         raw: null
  //       });
  //     }
  //   });

  // } catch (err) {
  //   console.error("Error scraping collections HTML:", err);
  // }

  // return allProducts;
}

export default scrapeShopifyBase