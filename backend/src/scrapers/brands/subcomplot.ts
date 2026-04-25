import scrapeWooCommerceBase from "../platforms/woocommerce";

export const Subcomplot = {
    name: "SubComplot",
    baseUrl: "https://www.subcomplot.cl",
    async scrape() {
        return await scrapeWooCommerceBase(this.baseUrl);
    }
};