import scrapeJumpsellerBase from "../platforms/jumpseller";

export const Treinoficial = {
  name: "Treinoficial",
  baseUrl: "https://www.treinoficial.cl",
  async scrape() {
    return await scrapeJumpsellerBase(this.baseUrl);
  }
};
