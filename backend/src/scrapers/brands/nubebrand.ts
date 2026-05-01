import scrapeShopifyBase from "../platforms/shopify";

export const NubeBrand = {
  name: "NubeBrand",
  baseUrl: "https://www.nubebrand.cl",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};
