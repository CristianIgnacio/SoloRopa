const { test, before, after, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// No production database or Google account is used by these regression tests.
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'google-auth-test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
process.env.COOKIE_SAME_SITE = 'none';

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../src/models/User').default;
const authRoutes = require('../src/routes/authRoutes').default;

let server;
let baseUrl;
const restores = [];
function stub(object, key, replacement) {
  const original = object[key];
  object[key] = replacement;
  restores.push(() => { object[key] = original; });
}

before(async () => {
  const app = express();
  app.use(express.json(), cookieParser());
  app.use('/api/auth', authRoutes);
  app.use((error, req, res, next) => res.status(500).json({ error: 'test error handler' }));
  server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
afterEach(() => { while (restores.length) restores.pop()(); });
after(async () => { await new Promise(resolve => server.close(resolve)); });

const signIn = () => fetch(`${baseUrl}/api/auth/google`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'test-google-id-token' }),
});
const payload = { sub: 'google-user-123', email: 'test@example.com', name: 'Test User' };
const mockGoogle = (claims) => stub(OAuth2Client.prototype, 'verifyIdToken', async (options) => {
  assert.equal(options.idToken, 'test-google-id-token');
  assert.equal(options.audience, process.env.GOOGLE_CLIENT_ID);
  return { getPayload: () => claims };
});

test('Google route exists and rejects an empty verified payload before accessing the database', async () => {
  mockGoogle(undefined);
  stub(User, 'findOne', () => { assert.fail('Database must not be accessed'); });
  const response = await signIn();
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Invalid Google token' });
  assert.equal(response.headers.get('set-cookie'), null);
});

test('Google verifier failures never create a session', async () => {
  stub(OAuth2Client.prototype, 'verifyIdToken', async () => { throw new Error('Invalid signature'); });
  stub(User, 'findOne', () => { assert.fail('Database must not be accessed'); });
  const response = await signIn();
  // Current controller forwards verifier errors to the global error handler.
  assert.equal(response.status, 500);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('existing Google user receives a secure cookie and can restore the session with CSRF', async () => {
  mockGoogle(payload);
  const user = { _id: 'user-123', id: 'user-123', username: 'testuser', role: 'user', googleId: payload.sub };
  stub(User, 'findOne', async () => user);
  stub(User, 'findById', async id => { assert.equal(id, user.id); return user; });
  const response = await signIn();
  assert.equal(response.status, 200);
  const csrf = response.headers.get('x-csrf-token');
  assert.ok(csrf);
  const cookie = response.headers.get('set-cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=None', 'Path=/']) assert.ok(cookie.includes(flag));
  const sessionCookie = cookie.split(';')[0];
  const claims = jwt.verify(sessionCookie.slice('token='.length), process.env.JWT_SECRET);
  assert.equal(claims.csrf, csrf);
  assert.equal(claims.id, user.id);
  const restored = await fetch(`${baseUrl}/api/auth/login/me`, {
    headers: { Cookie: sessionCookie, 'X-CSRF-Token': csrf },
  });
  assert.equal(restored.status, 200);
  assert.equal((await restored.json()).id, user.id);
  const rejected = await fetch(`${baseUrl}/api/auth/login/me`, { headers: { Cookie: sessionCookie } });
  assert.equal(rejected.status, 401);
});

test('new Google user is saved without requiring a password', async () => {
  mockGoogle(payload);
  stub(User, 'findOne', async () => null);
  let saved = false;
  stub(User.prototype, 'save', async function () {
    assert.equal(this.googleId, payload.sub);
    assert.equal(this.email, payload.email);
    assert.equal(this.password, undefined);
    await this.validate();
    saved = true;
    return this;
  });
  const response = await signIn();
  assert.equal(response.status, 200);
  assert.equal(saved, true);
  assert.equal((await response.json()).username, 'testuser');
});

test('existing email account is linked to Google', async () => {
  mockGoogle(payload);
  let saved = false;
  const user = { _id: 'user-123', id: 'user-123', username: 'existinguser', role: 'user',
    async save() { saved = true; } };
  stub(User, 'findOne', async () => user);
  const response = await signIn();
  assert.equal(response.status, 200);
  assert.equal(user.googleId, payload.sub);
  assert.equal(saved, true);
});
