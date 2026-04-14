import axios from "axios";
import { IProduct } from "../../models/Product";
import { ProductCategory } from "../../constants/productCategories";
import { normalizeProductMetadata } from "../tag-engine";
import type { CanonicalTags } from "../domain/Tag";
import { Gender } from "../domain/enums";

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
  canonicalTags?: CanonicalTags;
  gender?: Gender;
  categoryConfidence?: number;
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
          
          let finalImages: { src: string, alt: string }[] = [];
          if (p?.images && Array.isArray(p.images) && p.images.length > 0) {
            finalImages = p.images.map((i: any) => ({ src: i.src, alt: p.title }));
          } else if (p?.image?.src) {
            finalImages = [{ src: p.image.src, alt: p.title }];
          }

          // Identificar posiciones dinámicas de Talla y Color según p.options
          let colorPosition = 0;
          let sizePosition = 0;
          if (p?.options && Array.isArray(p.options)) {
            p.options.forEach((opt: any) => {
              if (opt.name && /(color|colour)/i.test(opt.name)) {
                colorPosition = opt.position;
              }
              if (opt.name && /(size|talla|medido)/i.test(opt.name)) {
                sizePosition = opt.position;
              }
            });
          }

          const variants = p?.variants?.map( (v : any) => {
            // Shopify usually serves the full merged title (e.g. "Negro / S") in v.title.
            // If missing, fallback to option1.
            const fullTitle = v.title && v.title !== "Default Title" ? v.title : v.option1;
            
            let color = undefined;
            let size = undefined;
            if (colorPosition > 0) color = v[`option${colorPosition}`];
            if (sizePosition > 0) size = v[`option${sizePosition}`];

            return {
              title: fullTitle,
              color,
              size,
              sku: v.sku,
              price: v.price ? Number(v.price) : undefined,
              comparePrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
              inStock: v.available
            }
          }) ?? [];

          const isActive = variants.some( (v : any) => v.inStock );

          // Unificamos titulo, product_type y tags nativos para el motor
          const rawTagsFromShopify = p.tags || []
          if (p.product_type) rawTagsFromShopify.push(p.product_type)

          const normalized = normalizeProductMetadata(p.title, rawTagsFromShopify, "")

          allProducts.push({
            title: p.title,
            url: new URL(`/products/${p.handle}`, baseUrl).toString(),

            price,
            currency: p?.variants?.[0]?.currency || null,
            inStock: p?.variants?.some((v: any) => v?.available) ?? undefined,
            isActive,
            
            category: normalized.category,
            categoryConfidence: normalized.categoryConfidence,
            gender: normalized.gender,
            tags: normalized.tags,
            canonicalTags: normalized.canonicalTags,
            
            images: finalImages,

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