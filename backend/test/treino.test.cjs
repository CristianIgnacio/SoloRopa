const assert = require("node:assert/strict");
const { test } = require("node:test");
const axios = require("axios");
const scrapeShopify = require("../src/scrapers/platforms/shopify").default;
const { Treinoficial } = require("../src/scrapers/brands/treinoficial");
const { planTreinoMigration } = require("../src/scrapers/treinoMigrationPlan");
const product = () => ({ id: 123, title: "Polera Treino", handle: "polera", tags: [],
  images: [{ src: "https://cdn.shopify.com/polera.jpg" }],
  variants: [{ title: "M", price: "29990", available: true }] });

test("Treino usa Shopify, guarda imágenes y precios CLP", async t => {
  const urls = [];
  t.mock.method(axios, "get", async url => { urls.push(url); return { data: { products: urls.length === 1 ? [product()] : [] } }; });
  const [p] = await Treinoficial.scrape();
  assert.equal(new URL(urls[0]).hostname, "treino.cl");
  assert.equal(p.url, "https://treino.cl/products/polera");
  assert.equal(p.currency, "CLP");
  assert.equal(p.price, 29990);
  assert.equal(p.images[0].src, product().images[0].src);
});
test("fallo de página 2 aborta y no devuelve catálogo parcial ni reintenta sin límite", async t => {
  let calls = 0;
  t.mock.method(axios, "get", async () => { if (++calls === 2) throw Error("HTTP 503"); return { data: { products: [product()] } }; });
  await assert.rejects(scrapeShopify("https://treino.cl"), /página 2: HTTP 503/);
  assert.equal(calls, 2);
});
test("rechaza HTML, catálogo vacío y productos sin imágenes", async t => {
  const mock = t.mock.method(axios, "get", async () => ({ data: "<html>Portada</html>" }));
  await assert.rejects(Treinoficial.scrape(), /no devolvió una lista/);
  mock.mock.mockImplementation(async () => ({ data: { products: [] } }));
  await assert.rejects(Treinoficial.scrape(), /catálogo vacío/);
  let calls = 0;
  mock.mock.mockImplementation(async () => ({ data: { products: ++calls === 1 ? [{ ...product(), images: [] }] : [] } }));
  await assert.rejects(Treinoficial.scrape(), /sin imágenes/);
});
test("la migración conserva IDs, separa nuevos y retirados y es repetible por URL", () => {
  const old = [{ _id: "original", title: 'POLERA "TREBOL"', url: "https://www.treinoficial.cl/polera" },
    { _id: "retired", title: "Camisa negra", url: "https://www.treinoficial.cl/camisa" }];
  const catalog = [{ title: "Polera Trébol", url: "https://treino.cl/products/nueva-polera" },
    { title: "Polera nueva", url: "https://treino.cl/products/nueva" }];
  const plan = planTreinoMigration(old, catalog);
  assert.equal(plan.matched[0].existing._id, "original");
  assert.equal(plan.retired[0]._id, "retired");
  assert.equal(plan.added.length, 1);
  const repeated = planTreinoMigration([...catalog.map((p, i) => ({ ...p, _id: String(i) })), old[1]], catalog);
  assert.equal(repeated.added.length, 0);
  assert.equal(repeated.matched.length, 2);
});
test("rechaza ambigüedades y no empareja prendas por parecido", () => {
  const old = [{ _id: "1", title: "Polera Negra", url: "https://www.treinoficial.cl/negra" }];
  assert.throws(() => planTreinoMigration(old, []), /vacío/);
  assert.throws(() => planTreinoMigration(old, [
    { title: "Polera Negra", url: "https://treino.cl/products/a" },
    { title: "Polera Negra", url: "https://treino.cl/products/b" },
  ]), /ambigua/);
  assert.equal(planTreinoMigration(old, [{ title: "Polera Blanca", url: "https://treino.cl/products/blanca" }]).retired.length, 1);
});
