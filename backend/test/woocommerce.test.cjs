const assert = require("node:assert/strict");
const { test } = require("node:test");
const axios = require("axios");
const scrapeWooCommerce = require("../src/scrapers/platforms/woocommerce").default;

const product = (overrides = {}) => ({
  name: "Polera JOIA",
  permalink: "https://joiamarket.com/p/polera-joia/",
  type: "variable",
  prices: { price: "29990", currency_code: "CLP" },
  is_in_stock: true,
  images: [{ src: "https://joiamarket.com/polera.jpg", alt: "Polera JOIA blanca" }],
  categories: [{ slug: "poleras" }],
  attributes: [
    { name: "Color", has_variations: false, terms: [{ slug: "blanco", name: "Blanco" }] },
    { name: "Talla", has_variations: true, terms: [{ slug: "s", name: "S" }, { slug: "m", name: "M" }] }
  ],
  variations: [
    { attributes: [{ name: "Talla", value: "s" }] },
    { attributes: [{ name: "Talla", value: "m" }], is_in_stock: false }
  ],
  ...overrides
});

test("Joia: conserva precios CLP y colores fijos sin duplicar tallas", async (t) => {
  const get = t.mock.method(axios, "get", async () => ({ data: [product()], headers: {} }));
  const [result] = await scrapeWooCommerce("https://joiamarket.com");
  assert.equal(get.mock.callCount(), 1);
  assert.equal(result.price, 29990);
  assert.equal(result.currency, "CLP");
  assert.equal(result.images[0].alt, "Polera JOIA blanca");
  assert.equal(result.variants.length, 2);
  assert.deepEqual(result.variants.map(v => v.title), ["Blanco / S", "Blanco / M"]);
  assert.equal(result.variants[0].inStock, undefined);
  assert.equal(result.variants[1].inStock, false);
});

test("Joia: un producto multicolor no genera opciones de color falsas", async (t) => {
  const item = product();
  item.attributes[0].terms.push({ slug: "negro", name: "Negro" });
  t.mock.method(axios, "get", async () => ({ data: [item], headers: {} }));
  const [result] = await scrapeWooCommerce("https://joiamarket.com");
  assert.equal(result.variants.length, 2);
  assert.ok(result.variants.every(v => v.color === "Blanco / Negro"));
});

test("respeta stock de productos simples y productos agotados", async (t) => {
  t.mock.method(axios, "get", async () => ({
    data: [product({ type: "simple", variations: [] }), product({ is_in_stock: false })],
    headers: {}
  }));
  const [simple, soldOut] = await scrapeWooCommerce("https://joiamarket.com");
  assert.ok(simple.variants.every(v => v.inStock === true));
  assert.equal(soldOut.isActive, false);
  assert.ok(soldOut.variants.every(v => v.inStock === false));
});

test("mantiene combinaciones de color y talla de otras tiendas WooCommerce", async (t) => {
  const item = product();
  item.attributes[0].has_variations = true;
  item.variations = [{
    attributes: [{ name: "Color", value: "blanco" }, { name: "Talla", value: "m" }],
    is_in_stock: true
  }];
  t.mock.method(axios, "get", async () => ({ data: [item], headers: {} }));
  const [result] = await scrapeWooCommerce("https://example.com");
  assert.equal(result.variants.length, 2);
  assert.equal(result.variants[0].inStock, false);
  assert.equal(result.variants[1].inStock, true);
});

test("termina en la última página indicada por WooCommerce", async (t) => {
  const urls = [];
  t.mock.method(axios, "get", async (url) => {
    urls.push(url);
    return { data: Array.from({ length: 50 }, () => product()), headers: { "x-wp-totalpages": "2" } };
  });
  const results = await scrapeWooCommerce("https://joiamarket.com");
  assert.equal(results.length, 100);
  assert.deepEqual(urls.map(url => new URL(url).searchParams.get("page")), ["1", "2"]);
});

test("un fallo de paginación no devuelve un catálogo parcial como éxito", async (t) => {
  t.mock.method(axios, "get", async (url) => {
    if (new URL(url).searchParams.get("page") === "2") throw new Error("HTTP 503");
    return { data: Array.from({ length: 50 }, () => product()), headers: {} };
  });
  await assert.rejects(scrapeWooCommerce("https://joiamarket.com"), /página 2: HTTP 503/);
});

test("rechaza respuestas HTML en lugar de productos", async (t) => {
  t.mock.method(axios, "get", async () => ({ data: "<html>Error</html>", headers: {} }));
  await assert.rejects(scrapeWooCommerce("https://joiamarket.com"), /no devolvió una lista/);
});
