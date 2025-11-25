import scrapeShopifyBase from "../platforms/shopify";
import scrapeWooCommerceBase from "../platforms/woocommerce";

export const Rudeboys = {
    name: "rudeboys",
    baseUrl: "https://www.rudeboys.cl",
    async scrape() {
        return await scrapeWooCommerceBase(this.baseUrl);
    }
};