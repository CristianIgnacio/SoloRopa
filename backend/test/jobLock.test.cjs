const assert = require("node:assert/strict");
const { test } = require("node:test");
const JobLock = require("../src/models/JobLock").default;
const { acquireJobLock, withJobLock, JobLockedError } = require("../src/utils/jobLock");
const { scrapeRudeboys } = require("../src/controllers/scrapeController");

const duplicateKey = () => Object.assign(new Error("E11000 duplicate key"), { code: 11000 });

test("toma el bloqueo solo si no existe o ya venció", async (t) => {
  const update = t.mock.method(JobLock, "updateOne", async () => ({ acknowledged: true }));
  const owner = await acquireJobLock("scrape:mdf", 60_000);
  assert.equal(typeof owner, "string");

  const [filter, change, options] = update.mock.calls[0].arguments;
  assert.equal(filter._id, "scrape:mdf");
  assert.ok(filter.expiresAt.$lte instanceof Date);
  assert.equal(change.$set.owner, owner);
  assert.equal(change.$set.expiresAt - change.$set.lockedAt, 60_000);
  assert.equal(options.upsert, true);
});

test("devuelve null si otro proceso tiene el bloqueo", async (t) => {
  t.mock.method(JobLock, "updateOne", async () => { throw duplicateKey(); });
  assert.equal(await acquireJobLock("scrape:mdf", 60_000), null);
});

test("no esconde otros errores de la base", async (t) => {
  t.mock.method(JobLock, "updateOne", async () => { throw new Error("sin conexión"); });
  await assert.rejects(acquireJobLock("scrape:mdf", 60_000), /sin conexión/);
});

test("withJobLock lanza JobLockedError y no ejecuta el trabajo si está tomado", async (t) => {
  t.mock.method(JobLock, "updateOne", async () => { throw duplicateKey(); });
  let ran = false;
  await assert.rejects(
    withJobLock("scrape:mdf", 60_000, async () => { ran = true; }),
    (err) => err instanceof JobLockedError && err.key === "scrape:mdf"
  );
  assert.equal(ran, false);
});

test("withJobLock libera el bloqueo aunque el trabajo falle, y solo el suyo", async (t) => {
  t.mock.method(JobLock, "updateOne", async () => ({ acknowledged: true }));
  const release = t.mock.method(JobLock, "deleteOne", async () => ({ deletedCount: 1 }));

  await assert.rejects(withJobLock("scrape:mdf", 60_000, async () => { throw new Error("tienda caída"); }), /tienda caída/);
  assert.equal(release.mock.callCount(), 1);
  const [filter] = release.mock.calls[0].arguments;
  assert.equal(filter._id, "scrape:mdf");
  assert.equal(typeof filter.owner, "string");

  assert.equal(await withJobLock("scrape:mdf", 60_000, async () => 42), 42);
  assert.equal(release.mock.callCount(), 2);
});

test("el endpoint de una marca responde 409 si ya se está scrapeando", async (t) => {
  t.mock.method(JobLock, "updateOne", async () => { throw duplicateKey(); });
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  await scrapeRudeboys({}, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /ya se está scrapeando/);
});
