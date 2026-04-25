import scrapeWooCommerceBase from "../platforms/woocommerce";

export const Rudeboys = {
    name: "Rudeboys",
    baseUrl: "https://www.rudeboys.cl",
    async scrape() {
        return await scrapeWooCommerceBase(this.baseUrl);
    }
};