const assert = require("node:assert/strict");
const { test } = require("node:test");
const dotenv = require("dotenv");
const dns = require("node:dns");

function loadConfig(t, overrides = {}) {
  // Credenciales ficticias: nunca leer .env en las pruebas.
  t.mock.method(dotenv, "config", () => ({}));
  const dnsMock = t.mock.method(dns, "setServers", () => {});
  const values = {
    NODE_ENV: "development", MONGODB_TARGET: undefined, MONGODB_DNS_SERVERS: undefined,
    MONGODB_URI: "mongodb://production.example", MONGODB_URI_LOCAL: "mongodb://local.example",
    TEST_MONGODB_URI: "mongodb://test.example", MONGODB_DBNAME: "SoloRopa",
    TEST_MONGODB_DBNAME: "SoloRopaTest", JWT_SECRET: "test-only-secret", ...overrides,
  };
  const original = {};
  for (const [key, value] of Object.entries(values)) {
    original[key] = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  const modulePath = require.resolve("../src/utils/config");
  delete require.cache[modulePath];
  t.after(() => {
    delete require.cache[modulePath];
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  return { config: require(modulePath).default, dnsMock };
}

test("desarrollo conecta a producción con MONGODB_TARGET=production", t => {
  const { config } = loadConfig(t, { MONGODB_TARGET: "production" });
  assert.equal(config.MONGODB_URI, "mongodb://production.example");
  assert.equal(config.MONGODB_DBNAME, "SoloRopa");
});
test("desarrollo sin override conserva la base local", t => {
  const { config, dnsMock } = loadConfig(t);
  assert.equal(config.MONGODB_URI, "mongodb://local.example");
  assert.equal(dnsMock.mock.callCount(), 0);
});
test("producción usa MONGODB_URI incluso con target local", t => {
  const { config } = loadConfig(t, { NODE_ENV: "production", MONGODB_TARGET: "local" });
  assert.equal(config.MONGODB_URI, "mongodb://production.example");
});
test("test nunca conecta a producción aunque el target lo indique", t => {
  const { config } = loadConfig(t, { NODE_ENV: "test", MONGODB_TARGET: "production" });
  assert.equal(config.MONGODB_URI, "mongodb://test.example");
  assert.equal(config.MONGODB_DBNAME, "SoloRopaTest");
});
test("aplica los DNS configurados antes de iniciar la conexión", t => {
  const { dnsMock } = loadConfig(t, { MONGODB_DNS_SERVERS: " 1.1.1.1, 8.8.8.8, " });
  assert.equal(dnsMock.mock.callCount(), 1);
  assert.deepEqual(dnsMock.mock.calls[0].arguments, [["1.1.1.1", "8.8.8.8"]]);
});
test("no oculta una configuración DNS inválida", t => {
  loadConfig(t);
  dns.setServers.mock.mockImplementation(() => { throw Error("Invalid IP address"); });
  process.env.MONGODB_DNS_SERVERS = "invalid-server";
  delete require.cache[require.resolve("../src/utils/config")];
  assert.throws(() => require("../src/utils/config"), /Invalid IP address/);
});
