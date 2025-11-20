import axios from "axios";
import * as cheerio from "cheerio";

export interface ShopifyProduct {
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
const scrapeShopifyBase = async (baseUrl: string): Promise<ShopifyProduct[]> => {
  const results: ShopifyProduct[] = [];

  // 1) Intentar /products.json
  try {
    const apiUrl = new URL("/products.json", baseUrl).toString();
    const { data } = await axios.get(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (scraper)" },
      timeout: 15000
    });
    if (data && data.products) {
      for (const p of data.products) {
        const price = p?.variants?.[0]?.price ? Number(p.variants[0].price) : null;
        const img = p?.image?.src ?? (p?.images?.[0]?.src ?? null);
        results.push({
          title: p.title,
          price,
          currency: p?.variants?.[0]?.currency || null,
          url: new URL(`/products/${p.handle}`, baseUrl).toString(),
          image: img,
          inStock: p?.variants?.some((v: any) => v?.available) ?? undefined,
          raw: p
        });
      }
      return results;
    }
  } catch (err) {
    // console.warn("products.json no disponible:", err.message);
  }

  // 2) Fallback a scraping HTML de colección
  try {
    const collectionUrlCandidates = ["/collections/all", "/collections/all?page=1"];
    let html: string | null = null;
    for (const path of collectionUrlCandidates) {
      try {
        const full = new URL(path, baseUrl).toString();
        const res = await axios.get(full, { timeout: 15000, headers: {"User-Agent":"Mozilla/5.0"}});
        if (res.data && typeof res.data === "string" && res.data.length > 500) {
          html = res.data;
          break;
        }
      } catch(e) { /* seguir */ }
    }
    if (!html) return results;
    const $ = cheerio.load(html);

    // Selector genérico: tarjetas de producto (ajusta si no coincide)
    const productElems = $("a[href*='/products/']");
    productElems.each((_, el) => {
      const a = $(el);
      const title = a.find("img[alt]").attr("alt") || a.find(".product-title, .card__title, .product-card__title").text().trim();
      const href = a.attr("href") || "";
      const img = a.find("img").attr("src") || a.find("img").attr("data-src") || null;
      let priceText = a.find(".price, .product-card__price, .price-item").text().trim();
      let price = null;
      if (priceText) {
        const m = priceText.replace(/\./g, "").match(/(\d+\,?\d*)/);
        if (m) price = Number(m[1].replace(",", "."));
      }
      if (href && title) {
        results.push({
          title,
          price,
          url: new URL(href, baseUrl).toString(),
          image: img,
          raw: null
        });
      }
    });

  } catch (err) {
    console.error("Error scraping collections HTML:", err);
  }

  return results;
}

export default scrapeShopifyBase