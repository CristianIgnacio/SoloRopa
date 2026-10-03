import scrapeShopifyBase from "../platforms/shopify";

export const Treinoficial = {
  name: "Treinoficial",
  baseUrl: "https://treino.cl",
  async scrape() {
    const products = await scrapeShopifyBase(this.baseUrl);
    if (!products.length || products.some(product => !product.images?.length)) {
      throw new Error("Treino devolvió un catálogo vacío o productos sin imágenes");
    }
    return products.map(product => ({ ...product, currency: "CLP" }));
  }
};
