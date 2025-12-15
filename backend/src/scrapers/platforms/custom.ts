import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeCustom(store: any) {
  const url = new URL(store.startPath, store.baseUrl).toString();
  
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(html);
  const results: any[] = [];

  // iteramos cada tarjeta de producto
  $(store.selectors.productItem).each((_, element) => {
    const item = $(element);

    // título
    const title = item.find(store.selectors.title).text().trim();

    // precio
    let priceText = item.find(store.selectors.price).text().trim();
    // sacar símbolos
    let price = null;
    const match = priceText.replace(/\./g, "").match(/(\d+)/);
    if (match) price = Number(match[1]);

    // imagen
    let image = item.find(store.selectors.image).attr("src");
    if (image && !image.startsWith("http")) {
      image = new URL(image, store.baseUrl).toString();
    }

    // link
    let link = item.find(store.selectors.link).attr("href");
    if (link && !link.startsWith("http")) {
      link = new URL(link, store.baseUrl).toString();
    }

    // armamos el resultado
    results.push({
      title,
      price,
      url: link,
      image,
      store: store.name,
      scrapedAt: new Date()
    });
  });

  return results;
}
