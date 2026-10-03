import scrapeShopifyBase from "../platforms/shopify";

export const Stodak = {
  name: "Stodak",
  baseUrl: "https://www.stodak.com",
  async scrape() {
    const products = await scrapeShopifyBase(this.baseUrl);
    // La tienda vende en CLP, pero products.json omite la moneda.
    return products.map(product => ({
      ...product,
      currency: product.currency ?? "CLP"
    }));
  }
};
