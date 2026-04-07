import axios from "axios";
import * as cheerio from "cheerio";
import { IProduct } from "../../models/Product";

export interface JumpsellerProduct extends Partial<IProduct> {
  title: string;
  price: number | null;
  currency?: string | null;
  url: string;
  images?: { src: string; alt?: string }[] | [];
  category: string;
  tags: string[];
  inStock?: boolean;
  isActive?: boolean;
  variants?: { title: string; sku?: string; price?: number; comparePrice?: number; inStock?: boolean }[];
  raw?: any;
}

const scrapeJumpsellerBase = async (baseUrl: string): Promise<JumpsellerProduct[]> => {
  console.log(`🛍️ Iniciando scraping Jumpseller: ${baseUrl}`);
  let sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  let sitemapXml = "";
  try {
    const { data } = await axios.get(sitemapUrl, { timeout: 15000 });
    sitemapXml = data;
  } catch (e) {
    try {
      const { data } = await axios.get(`${baseUrl}/sitemap_1.xml`, { timeout: 15000 });
      sitemapXml = data;
    } catch(e2) {
      console.error("❌ No se pudo obtener sitemap para " + baseUrl);
      return [];
    }
  }

  const $ = cheerio.load(sitemapXml, { xmlMode: true });
  
  // En Jumpseller el sitemap suele darle <priority>0.8</priority> a todos los productos.
  const highPriorityUrls: string[] = [];
  $('url').each((i, el) => {
    const priority = $(el).find('priority').text();
    const loc = $(el).find('loc').text();
    if (priority === "0.8") {
      highPriorityUrls.push(loc);
    }
  });

  let targetUrls = highPriorityUrls;
  
  // Si no hay priorities, agrupamos todo loc filtrando carpetas comunes
  if (targetUrls.length === 0) {
    $('loc').each((i, el) => {
      const u = $(el).text();
      if (!u.endsWith('.xml') && u !== baseUrl && u !== baseUrl + "/" && !u.includes("/contact") && !u.includes("/about") && !u.includes("/blog")) {
        targetUrls.push(u);
      }
    });
  }
  
  console.log(`📄 Encontradas ${targetUrls.length} posibles URLs de producto en el Sitemap`);
  const allProducts: JumpsellerProduct[] = [];

  const batchSize = 10;
  for (let i = 0; i < targetUrls.length; i += batchSize) {
    const batch = targetUrls.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (url) => {
      try {
        const { data: html } = await axios.get(url, { timeout: 15000 });
        const $html = cheerio.load(html);
        
        const jsonLdScript = $html('script[type="application/ld+json"]').html();
        if (jsonLdScript) {
          const parsed = JSON.parse(jsonLdScript);
          
          if (parsed['@type'] === 'Product' || parsed['@type'] === 'http://schema.org/Product') {
            let price = null;
            let inStock = true;
            let currency = "CLP";

            if (parsed.offers) {
              price = Number(parsed.offers.price || parsed.offers.lowPrice);
              currency = parsed.offers.priceCurrency || "CLP";
              if (parsed.offers.availability && typeof parsed.offers.availability === 'string') {
                if (parsed.offers.availability.includes('OutOfStock')) inStock = false;
              }
            }

            let title = parsed.name || $html('h1.page-header, h1.product-name, h1').first().text().trim();
            
            let finalImages: {src: string, alt: string}[] = [];
            if (parsed.image) {
              if (Array.isArray(parsed.image)) {
                finalImages = parsed.image.map((img: string) => ({ src: img, alt: title }));
              } else if (typeof parsed.image === "string") {
                finalImages = [{ src: parsed.image, alt: title }];
              }
            } else {
               // Fallback agarrando img
               const srcAttr = $html('.product-image img, #product-image img').first().attr('src');
               if (srcAttr) finalImages = [{ src: srcAttr, alt: title }];
            }

            if (title && price) {
              allProducts.push({
                title,
                url,
                price,
                currency,
                inStock,
                isActive: inStock,
                images: finalImages,
                category: parsed.category ?? 'otros',
                tags: [],
                variants: [],
                raw: parsed
              });
            }
          }
        }
      } catch (err) {
         // Silently skip if page fails or JSON parse fails
      }
    }));
    
    process.stdout.write(`\r✔ Procesados ${Math.min(i + batchSize, targetUrls.length)} / ${targetUrls.length}`);
    await new Promise(r => setTimeout(r, 500)); // Respect server intervals
  }

  console.log(`\n✨ Total productos encontrados en Jumpseller: ${allProducts.length}`);
  return allProducts;
};

export default scrapeJumpsellerBase;
