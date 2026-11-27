// Antes de cargar config: simular la base de producción y un secreto conocido.
process.env.MONGODB_TARGET = "production";
process.env.EMAIL_TOKEN_SECRET = "secreto-de-prueba";
delete process.env.BREVO_API_KEY;

const assert = require("node:assert/strict");
const { test } = require("node:test");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { isAlertableDrop, buildDigest, dropPercent } = require("../src/utils/priceAlerts");
const { renderPriceDropEmail } = require("../src/emails/priceDropEmail");
const { signUnsubscribeToken, verifyUnsubscribeToken } = require("../src/utils/emailTokens");
const { sendEmail, parseSender, getMailerMode } = require("../src/utils/mailer");
const { getSendBlocker } = require("../src/services/priceAlerts");

const available = { isActive: true, inStock: true };

// --- isAlertableDrop ---

test("avisa desde un 5% de bajada", () => {
  assert.equal(isAlertableDrop(20000, 19000, available), true);   // 5%
  assert.equal(isAlertableDrop(20000, 19100, available), false);  // 4,5%
  assert.equal(isAlertableDrop(20000, 21000, available), false);  // subió
});

test("no avisa productos nuevos, sin stock, inactivos ni precios sospechosos", () => {
  assert.equal(isAlertableDrop(null, 10000, available), false);
  assert.equal(isAlertableDrop(0, 10000, available), false);
  assert.equal(isAlertableDrop(20000, 15000, { isActive: true, inStock: false }), false);
  assert.equal(isAlertableDrop(20000, 15000, { isActive: false, inStock: true }), false);
  assert.equal(isAlertableDrop(20000, 990, available), false);     // menos de $1.000
  assert.equal(isAlertableDrop(200000, 19000, available), false);  // cae más de un 90%
  assert.equal(isAlertableDrop(20000, 15000, {}), true);           // sin datos de stock: se asume disponible
});

// --- buildDigest ---

const alert = (id, product, oldPrice, newPrice) => ({ _id: id, product, oldPrice, newPrice });
const product = (id, currentPrice, extra = {}) => [id, { id, title: `Producto ${id}`, currentPrice, isLowest30d: false, ...available, ...extra }];

test("junta varias bajadas del mismo producto y usa el precio actual", () => {
  const { items, skipped } = buildDigest(
    [alert("a1", "p1", 30000, 27000), alert("a2", "p1", 27000, 24000)],
    new Map([product("p1", 23990)])
  );
  assert.equal(skipped.length, 0);
  assert.equal(items.length, 1);
  assert.deepEqual(
    { oldPrice: items[0].oldPrice, newPrice: items[0].newPrice, percent: items[0].percent, alertIds: items[0].alertIds },
    { oldPrice: 30000, newPrice: 23990, percent: dropPercent(30000, 23990), alertIds: ["a1", "a2"] }
  );
});

test("descarta si el producto no existe, no está disponible o volvió a subir", () => {
  const { items, skipped } = buildDigest(
    [alert("a1", "gone", 10000, 9000), alert("a2", "nostock", 10000, 9000), alert("a3", "up", 10000, 9000), alert("a4", "ok", 10000, 9000)],
    new Map([product("nostock", 9000, { inStock: false }), product("up", 9500), product("ok", 9000)])
  );
  assert.deepEqual(items.map((i) => i.productId), ["ok"]);
  assert.deepEqual(
    skipped.map((s) => [s.alertIds[0], s.reason]),
    [["a1", "product-missing"], ["a2", "unavailable"], ["a3", "price-rose"]]
  );
});

test("ordena por mayor bajada", () => {
  const { items } = buildDigest(
    [alert("a1", "p1", 10000, 9500), alert("a2", "p2", 10000, 6000), alert("a3", "p3", 10000, 8000)],
    new Map([product("p1", 9500), product("p2", 6000), product("p3", 8000)])
  );
  assert.deepEqual(items.map((i) => i.productId), ["p2", "p3", "p1"]);
});

// --- Correo ---

const item = (overrides = {}) => ({
  productId: "abc123", title: "Polerón Oversize", brandName: "MDF", imageUrl: "https://cdn.test/p.jpg",
  oldPrice: 29990, newPrice: 24990, percent: 17, isLowest30d: true, alertIds: ["a1"], ...overrides,
});
const emailInput = (overrides = {}) => ({
  username: "ana", items: [item()], extraCount: 0, frontendUrl: "https://soloropa.test",
  unsubscribeUrl: "https://soloropa.test/desuscribir?token=t&x=1", ...overrides,
});

test("el asunto nombra el producto si es uno solo, o cuenta los favoritos", () => {
  assert.equal(renderPriceDropEmail(emailInput()).subject, "Bajó de precio: Polerón Oversize");
  assert.equal(renderPriceDropEmail(emailInput({ items: [item(), item({ productId: "x" })], extraCount: 3 })).subject,
    "5 de tus favoritos bajaron de precio");
});

test("el correo trae precios, link al producto, etiqueta y link para desuscribirse", () => {
  const { html, text } = renderPriceDropEmail(emailInput());
  assert.match(html, /\$29\.990/);
  assert.match(html, /\$24\.990/);
  assert.match(html, /-17%/);
  assert.match(html, /Mínimo en 30 días/);
  assert.match(html, /href="https:\/\/soloropa\.test\/producto\/abc123"/);
  assert.match(html, /href="https:\/\/soloropa\.test\/desuscribir\?token=t&amp;x=1"/);
  assert.match(text, /\$29\.990 → \$24\.990 \(-17%\)/);
  assert.match(text, /Dejar de recibir estos avisos: https:\/\/soloropa\.test\/desuscribir\?token=t&x=1/);
});

test("los títulos de las tiendas se escapan en el HTML", () => {
  const { html } = renderPriceDropEmail(emailInput({ items: [item({ title: `<img src=x onerror="alert(1)">`, brandName: "A&B" })] }));
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /A&amp;B/);
});

test("resume los productos que no caben", () => {
  const { html, text } = renderPriceDropEmail(emailInput({ extraCount: 4 }));
  assert.match(html, /Y 4 productos más bajaron de precio/);
  assert.match(text, /Y 4 más/);
});

// --- Tokens de desuscripción ---

test("el token de desuscripción identifica al usuario", () => {
  const token = signUnsubscribeToken("user-1");
  assert.equal(verifyUnsubscribeToken(token), "user-1");
});

test("rechaza tokens alterados, de otro propósito o con otro secreto", () => {
  const token = signUnsubscribeToken("user-1");
  assert.equal(verifyUnsubscribeToken(token.slice(0, -2) + "xx"), null);
  assert.equal(verifyUnsubscribeToken(jwt.sign({ sub: "user-1", purpose: "otra-cosa" }, "secreto-de-prueba")), null);
  assert.equal(verifyUnsubscribeToken(jwt.sign({ sub: "user-1", purpose: "unsubscribe:price-drops" }, "otro-secreto")), null);
  assert.equal(verifyUnsubscribeToken(undefined), null);
  assert.equal(verifyUnsubscribeToken(["x"]), null);
});

// --- Mailer ---

test("interpreta el remitente con y sin nombre", () => {
  assert.deepEqual(parseSender('SoloRopa <alertas@soloropa.cl>'), { name: "SoloRopa", email: "alertas@soloropa.cl" });
  assert.deepEqual(parseSender('"Solo Ropa" <a@b.cl>'), { name: "Solo Ropa", email: "a@b.cl" });
  assert.deepEqual(parseSender("a@b.cl"), { email: "a@b.cl" });
  assert.equal(parseSender(""), null);
});

test("con BREVO_API_KEY envía por la API de Brevo", async (t) => {
  t.after(() => { delete process.env.BREVO_API_KEY; delete process.env.MAIL_FROM; });
  process.env.BREVO_API_KEY = "xkeysib-prueba";
  process.env.MAIL_FROM = "SoloRopa <alertas@soloropa.cl>";
  const post = t.mock.method(axios, "post", async () => ({ data: { messageId: "<id@brevo>" } }));

  const result = await sendEmail({ to: "ana@test.cl", toName: "ana", subject: "Hola", html: "<p>h</p>", text: "h", headers: { "List-Unsubscribe": "<x>" } });

  assert.equal(getMailerMode(), "brevo");
  assert.equal(result.messageId, "<id@brevo>");
  const [url, body, options] = post.mock.calls[0].arguments;
  assert.equal(url, "https://api.brevo.com/v3/smtp/email");
  assert.deepEqual(body.sender, { name: "SoloRopa", email: "alertas@soloropa.cl" });
  assert.deepEqual(body.to, [{ email: "ana@test.cl", name: "ana" }]);
  assert.equal(body.htmlContent, "<p>h</p>");
  assert.equal(body.textContent, "h");
  assert.deepEqual(body.headers, { "List-Unsubscribe": "<x>" });
  assert.equal(options.headers["api-key"], "xkeysib-prueba");
});

test("un error de Brevo no filtra la API key", async (t) => {
  t.after(() => { delete process.env.BREVO_API_KEY; delete process.env.MAIL_FROM; });
  process.env.BREVO_API_KEY = "xkeysib-secreta";
  process.env.MAIL_FROM = "a@b.cl";
  t.mock.method(axios, "post", async () => {
    throw Object.assign(new Error("Request failed"), {
      config: { headers: { "api-key": "xkeysib-secreta" } },
      response: { status: 401, data: { message: "Key not found" } },
    });
  });

  await assert.rejects(sendEmail({ to: "a@b.cl", subject: "s", html: "h", text: "t" }), (err) => {
    assert.match(err.message, /HTTP 401.*Key not found/);
    assert.doesNotMatch(err.message + JSON.stringify(err), /xkeysib-secreta/);
    return true;
  });
});

// --- Envío diario ---

test("con la base de producción no envía avisos sin Brevo ni secreto", (t) => {
  t.after(() => { delete process.env.BREVO_API_KEY; process.env.EMAIL_TOKEN_SECRET = "secreto-de-prueba"; });
  assert.match(getSendBlocker(), /BREVO_API_KEY/);

  process.env.BREVO_API_KEY = "xkeysib-prueba";
  delete process.env.EMAIL_TOKEN_SECRET;
  assert.match(getSendBlocker(), /EMAIL_TOKEN_SECRET/);

  process.env.EMAIL_TOKEN_SECRET = "secreto-de-prueba";
  assert.equal(getSendBlocker(), null);
});
