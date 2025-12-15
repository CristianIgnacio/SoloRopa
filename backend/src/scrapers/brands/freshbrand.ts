import scrapeShopifyBase from "../platforms/shopify";

export const Freshbrand = {
  name: "Freshbrand",
  baseUrl: "https://www.freshbrand.cl",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};