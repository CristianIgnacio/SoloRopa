import axios from "axios";
// import * as cheerio from "cheerio";

export interface WooCommerceProduct {
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

  console.log(`🛍️ Iniciando scraping Shopify: ${baseUrl}`);

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
          
          const img = p?.image?.src 
            ?? (p?.images?.map( (i : any) => {
                return { src : i.src, alt : p.alt} 
              }) 
                ?? []);

          allProducts.push({
            title: p.name,
            price,
            currency: p?.prices.currency_code || null,
            url: new URL(`/products/${p.handle}`, baseUrl).toString(),
            image: img,
            inStock: p?.is_in_stock ?? undefined,
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