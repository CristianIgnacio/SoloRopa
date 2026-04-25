import scrapeShopifyBase from "../platforms/shopify";

export const Whatup = {
  name: "Whatup",
  baseUrl: "https://www.streetmachine.cl/collections/whatup",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};
