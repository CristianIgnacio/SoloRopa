import scrapeShopifyBase from "../platforms/shopify";

export const MDF = {
  name: "MDF",
  baseUrl: "https://ropamdf.cl",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};