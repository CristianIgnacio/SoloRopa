const assert = require("node:assert/strict");
const { test } = require("node:test");
const { Types } = require("mongoose");
const { getTrackedPrice, hasPriceChanged } = require("../src/utils/priceTracking");
const Product = require("../src/models/Product").default;
const PriceHistory = require("../src/models/PriceHistory").default;
const { saveOrUpdateProduct } = require("../src/scrapers/index");

// --- getTrackedPrice ---

test("usa el precio más bajo entre variantes e ignora precios inválidos", () => {
  const tracked = getTrackedPrice(
    [{ price: 34990 }, { price: 0 }, { price: null }, { price: NaN }, { price: 29990 }, { price: 31990 }],
    99990
  );
  assert.deepEqual(tracked, { price: 29990, comparePrice: null });
});

test("sin variantes con precio usa product.price, y sin nada devuelve null", () => {
  assert.deepEqual(getTrackedPrice([{ price: undefined }], 19990), { price: 19990, comparePrice: null });
  assert.deepEqual(getTrackedPrice(null, 19990), { price: 19990, comparePrice: null });
  assert.equal(getTrackedPrice([], null), null);
  assert.equal(getTrackedPrice([{ price: 0 }], 0), null);
});

test("comparePrice solo se guarda si es mayor que el precio", () => {
  assert.deepEqual(getTrackedPrice([{ price: 24990, comparePrice: 34990 }], null), { price: 24990, comparePrice: 34990 });
  assert.deepEqual(getTrackedPrice([{ price: 24990, comparePrice: 24990 }], null), { price: 24990, comparePrice: null });
  assert.deepEqual(getTrackedPrice([{ price: 24990, comparePrice: 19990 }], null), { price: 24990, comparePrice: null });
});

test("con precios empatados no depende del orden de las variantes", () => {
  const a = getTrackedPrice([{ price: 24990 }, { price: 24990, comparePrice: 34990 }], null);
  const b = getTrackedPrice([{ price: 24990, comparePrice: 34990 }, { price: 24990 }], null);
  assert.deepEqual(a, { price: 24990, comparePrice: 34990 });
  assert.deepEqual(b, a);
});

// --- hasPriceChanged ---

test("hasPriceChanged compara solo el precio", () => {
  assert.equal(hasPriceChanged(null, { price: 100, comparePrice: null }), true);
  assert.equal(hasPriceChanged({ price: 100, comparePrice: null }, null), false);
  assert.equal(hasPriceChanged({ price: 100, comparePrice: null }, { price: 100, comparePrice: 150 }), false);
  assert.equal(hasPriceChanged({ price: 100, comparePrice: null }, { price: 90, comparePrice: null }), true);
  assert.equal(hasPriceChanged({ price: 90, comparePrice: null }, { price: 100, comparePrice: null }), true);
});

// --- saveOrUpdateProduct ---

const productId = new Types.ObjectId();

const input = (overrides = {}) => ({
  title: "Polera",
  brand: new Types.ObjectId(),
  url: "https://tienda.cl/p/polera",
  price: 29990,
  currency: "CLP",
  variants: [{ title: "M", price: 29990 }],
  ...overrides,
});

const previousDoc = (price, overrides = {}) => ({
  _id: productId,
  price,
  currency: "CLP",
  variants: [{ title: "M", price }],
  scrapedAt: new Date("2026-11-01T06:00:00Z"),
  ...overrides,
});

function mockDb(t, { previous = null, hasHistory = true } = {}) {
  const updateCalls = [];
  const inserted = [];
  t.mock.method(Product, "findOneAndUpdate", async (...args) => {
    updateCalls.push(args);
    return previous
      ? { value: previous, lastErrorObject: { updatedExisting: true } }
      : { value: null, lastErrorObject: { updatedExisting: false, upserted: productId } };
  });
  t.mock.method(PriceHistory, "exists", async () => (hasHistory ? { _id: new Types.ObjectId() } : null));
  t.mock.method(PriceHistory, "insertMany", async (rows) => {
    inserted.push(...rows);
    return rows;
  });
  return { updateCalls, inserted };
}

test("pide el documento anterior en la misma consulta que actualiza", async (t) => {
  const { updateCalls } = mockDb(t, { previous: previousDoc(29990) });
  await saveOrUpdateProduct(input());
  const [filter, , options] = updateCalls[0];
  assert.deepEqual(filter, { url: "https://tienda.cl/p/polera" });
  assert.equal(options.upsert, true);
  assert.equal(options.returnDocument, "before");
});

test("producto nuevo abre su historial con el precio actual", async (t) => {
  const { inserted } = mockDb(t, { previous: null });
  const change = await saveOrUpdateProduct(input());
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].product, productId);
  assert.equal(inserted[0].price, 29990);
  assert.equal(inserted[0].currency, "CLP");
  assert.equal(change.previousPrice, null);
  assert.equal(change.newPrice, 29990);
});

test("si el precio no cambió no agrega filas", async (t) => {
  const { inserted } = mockDb(t, { previous: previousDoc(29990) });
  const change = await saveOrUpdateProduct(input());
  assert.equal(change, null);
  assert.equal(inserted.length, 0);
});

test("una bajada guarda una fila con el precio nuevo", async (t) => {
  const { inserted } = mockDb(t, { previous: previousDoc(34990), hasHistory: true });
  const change = await saveOrUpdateProduct(input());
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].price, 29990);
  assert.deepEqual(
    { previousPrice: change.previousPrice, newPrice: change.newPrice },
    { previousPrice: 34990, newPrice: 29990 }
  );
});

test("primer cambio de un producto sin historial guarda también el precio anterior", async (t) => {
  const previous = previousDoc(34990);
  const { inserted } = mockDb(t, { previous, hasHistory: false });
  await saveOrUpdateProduct(input());
  assert.equal(inserted.length, 2);
  assert.equal(inserted[0].price, 34990);
  assert.equal(inserted[0].recordedAt, previous.scrapedAt);
  assert.equal(inserted[1].price, 29990);
});

test("una extracción sin precio no registra nada", async (t) => {
  const { inserted } = mockDb(t, { previous: previousDoc(29990) });
  const change = await saveOrUpdateProduct(input({ price: null, variants: [] }));
  assert.equal(change, null);
  assert.equal(inserted.length, 0);
});

test("los campos que no vienen conservan el precio guardado", async (t) => {
  const { inserted } = mockDb(t, { previous: previousDoc(29990) });
  const change = await saveOrUpdateProduct(input({ price: undefined, variants: undefined }));
  assert.equal(change, null);
  assert.equal(inserted.length, 0);
});

// --- getPriceWindow / computePriceStats ---

const { getPriceWindow, computePriceStats, parseHistoryDays } = require("../src/utils/priceTracking");

const d = (iso) => new Date(`${iso}T00:00:00Z`);
const row = (price, iso) => ({ price, recordedAt: d(iso) });
// Ejemplo del plan: punto de partida 1-oct, baja el 25-oct y otra vez el 20-nov.
const history = [row(29990, "2026-10-01"), row(27990, "2026-10-25"), row(24990, "2026-11-20")];

test("la ventana incluye el precio vigente al inicio, movido al borde", () => {
  const points = getPriceWindow(history, d("2026-11-27"), 30);
  assert.deepEqual(points, [row(27990, "2026-10-28"), row(24990, "2026-11-20")]);
});

test("sin filas anteriores a la ventana, devuelve solo las de adentro", () => {
  const points = getPriceWindow([row(19990, "2026-11-20")], d("2026-11-27"), 30);
  assert.deepEqual(points, [row(19990, "2026-11-20")]);
});

test("la ventana ignora filas futuras y no depende del orden", () => {
  const unsorted = [history[2], row(9990, "2026-12-31"), history[0], history[1]];
  assert.deepEqual(getPriceWindow(unsorted, d("2026-11-27"), 30), getPriceWindow(history, d("2026-11-27"), 30));
});

test("precio más bajo en 30 días con el ejemplo del plan", () => {
  assert.deepEqual(computePriceStats(history, d("2026-11-27")), {
    current: 24990,
    min30d: 24990,
    max30d: 27990,
    isLowest30d: true,
    trackedSince: d("2026-10-01"),
    lastChangeAt: d("2026-11-20"),
  });
});

test("no hay etiqueta si llevamos menos de 30 días siguiéndolo", () => {
  const recent = [row(29990, "2026-11-10"), row(24990, "2026-11-20")];
  assert.equal(computePriceStats(recent, d("2026-11-27")).isLowest30d, false);
});

test("no hay etiqueta si el precio no cambió en la ventana", () => {
  const stable = [row(24990, "2026-09-01")];
  const stats = computePriceStats(stable, d("2026-11-27"));
  assert.equal(stats.isLowest30d, false);
  assert.equal(stats.min30d, stats.max30d);
});

test("no hay etiqueta si el precio subió", () => {
  const up = [row(24990, "2026-10-01"), row(29990, "2026-11-20")];
  assert.equal(computePriceStats(up, d("2026-11-27")).isLowest30d, false);
});

test("la etiqueta se apaga cuando el precio alto sale de la ventana", () => {
  // La bajada del 20-nov deja de ser "la más baja en 30 días" 30 días después.
  assert.equal(computePriceStats(history, d("2026-12-19")).isLowest30d, true);
  assert.equal(computePriceStats(history, d("2026-12-21")).isLowest30d, false);
});

test("sin historial no hay estadísticas", () => {
  assert.equal(computePriceStats([], d("2026-11-27")), null);
  assert.equal(computePriceStats([row(9990, "2026-12-31")], d("2026-11-27")), null);
});

test("?days se limita entre 1 y 365 con 90 por defecto", () => {
  assert.equal(parseHistoryDays(undefined), 90);
  assert.equal(parseHistoryDays("abc"), 90);
  assert.equal(parseHistoryDays("0"), 90);
  assert.equal(parseHistoryDays("-5"), 90);
  assert.equal(parseHistoryDays("30"), 30);
  assert.equal(parseHistoryDays("29.6"), 30);
  assert.equal(parseHistoryDays("1000"), 365);
});
