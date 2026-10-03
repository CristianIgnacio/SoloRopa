import scrapeWooCommerceBase from "../platforms/woocommerce";

export const JoiaMarket = {
  name: "Joia Market",
  baseUrl: "https://joiamarket.com",
  async scrape() {
    return await scrapeWooCommerceBase(this.baseUrl);
  }
};
