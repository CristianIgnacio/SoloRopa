import scrapeShopifyBase from "../platforms/shopify";

export const BelowApparel = {
  name: "Below Apparel",
  baseUrl: "https://www.belowapparel.com",
  async scrape() {
    return await scrapeShopifyBase(this.baseUrl);
  }
};
