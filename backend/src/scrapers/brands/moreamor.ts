import scrapeShopifyBase from "../platforms/shopify";

export const Moreamor = {
  name: "Moreamor",
  baseUrl: "https://www.moreamor.cl",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};