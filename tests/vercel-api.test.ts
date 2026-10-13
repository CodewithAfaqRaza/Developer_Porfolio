import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test, type TestContext } from 'node:test';
import { LibsqlDatabase, productionDatabase } from '../server/libsql.ts';
import { handleVercel, type VercelEnvironment } from '../server/vercel.ts';
import { decryptInquiryPayload } from '../server/contact.ts';
import { adminHash } from '../server/admin.ts';

const origin = 'https://portfolio.example';
async function fixture(t: TestContext) {
  const client = createClient({ url: 'file::memory:', intMode: 'number' });
  t.after(() => client.close());
  for (const migration of ['0001_contact.sql', '0002_admin.sql', '0003_notifications.sql']) await client.executeMultiple(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), 'utf8'));
  const database = new LibsqlDatabase(client);
  const password = randomBytes(32).toString('base64url');
  const settings: VercelEnvironment = { VERCEL: '1', SITE_ORIGIN: origin, DATA_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
    RATE_LIMIT_SECRET: randomBytes(32).toString('hex'), ADMIN_PASSWORD_HASH: await adminHash(password),
    TURNSTILE_SITE_KEY: '0xreal-public-widget-key-for-server-tests', TURNSTILE_SECRET_KEY: '0xreal-private-widget-key-for-server-tests',
    CRON_SECRET: randomBytes(32).toString('hex') };
  return { client, database, settings, password };
}
function request(path: string, body?: object, extra: Record<string, string> = {}) {
  return new Request(`${origin}${path}`, { method: body ? 'POST' : 'GET', headers: { 'x-vercel-forwarded-for': '203.0.113.10',
    ...(body ? { Origin: origin, 'Content-Type': 'application/json' } : {}), ...extra }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
test('libSQL adapter binds parameters and atomically rolls back failed multi-statement writes', async t => {
  const f = await fixture(t);
  const dangerous = "'); DELETE FROM contact_inquiries; --";
  await f.database.prepare('INSERT INTO contact_rate_limits (key, attempts, expires_at) VALUES (?, 1, ?)').bind(dangerous, Date.now()).run();
  assert.equal((await f.database.prepare('SELECT key FROM contact_rate_limits WHERE key = ?').bind(dangerous).first<{ key: string }>())?.key, dangerous);
  await assert.rejects(f.database.batch([
    f.database.prepare('DELETE FROM contact_rate_limits'),
    f.database.prepare('INSERT INTO contact_rate_limits (key, attempts, expires_at) VALUES (?, 102, 1)').bind('invalid'),
  ]));
  assert.equal((await f.database.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').first<{ count: number }>())?.count, 1);
});
test('Vercel routes fail closed for missing credentials, wrong origins and unknown API paths', async t => {
  const f = await fixture(t);
  assert.equal((await handleVercel(request('/api/contact/config'), {})).status, 503);
  assert.equal((await handleVercel(request('/api/contact/config'), { VERCEL: '1', SITE_ORIGIN: origin })).status, 503);
  assert.equal((await handleVercel(request('/api/contact/config'), { ...f.settings, SITE_ORIGIN: 'https://other.example' }, f.database)).status, 503);
  assert.equal((await handleVercel(request('/api/not-found'), f.settings, f.database)).status, 404);
  const config = await handleVercel(request('/api?route=contact/config'), f.settings, f.database);
  assert.equal(config.status, 200);
  assert.deepEqual(await config.json(), { siteKey: f.settings.TURNSTILE_SITE_KEY, local: false, hosting: 'vercel' });
  assert.equal(config.headers.get('X-Frame-Options'), 'DENY');
  assert.equal((await handleVercel(request('/api/admin/inquiries'), f.settings, f.database)).status, 401);
});
test('Vercel accepts a real verified enquiry, persists ciphertext, and ignores forged Cloudflare IP headers', async t => {
  const f = await fixture(t);
  const remoteIPs: string[] = [];
  t.mock.method(globalThis, 'fetch', async (_input: unknown, options: RequestInit) => {
    remoteIPs.push(JSON.parse(String(options.body)).remoteip);
    return Response.json({ success: true, hostname: 'portfolio.example', action: 'contact', challenge_ts: new Date().toISOString() });
  });
  const body = { name: 'Vercel Adapter Test', email: 'vercel-test@example.com', phone: '', country: 'PK', kind: 'project', description: 'A synthetic event website request for adapter verification.', budget: 'discuss', consent: true, website: '', turnstileToken: 'real-provider-test-token' };
  const response = await handleVercel(request('/api?route=contact', body, { 'CF-Connecting-IP': '198.51.100.9', 'x-forwarded-for': '198.51.100.8' }), f.settings, f.database);
  assert.equal(response.status, 201);
  assert.deepEqual(remoteIPs, ['203.0.113.10']);
  const { reference } = await response.json();
  const row = await f.database.prepare('SELECT id, created_at, payload FROM contact_inquiries WHERE id = ?').bind(reference).first<{ id: string; created_at: number; payload: string }>();
  assert.ok(row);
  assert.ok(!row.payload.includes(body.email));
  const decoded = await decryptInquiryPayload(row.payload, f.settings.DATA_ENCRYPTION_KEY!, row.id, row.created_at) as Record<string, unknown>;
  assert.equal(decoded.email, body.email);
  const untrusted = request('/api/contact', body); untrusted.headers.delete('x-vercel-forwarded-for');
  assert.equal((await handleVercel(untrusted, f.settings, f.database)).status, 503);
  assert.equal((await handleVercel(request('/api/contact', body, { Origin: 'https://evil.example' }), f.settings, f.database)).status, 403);
});
test('Vercel login action, secure session cookies and logout work with the libSQL adapter', async t => {
  const f = await fixture(t);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, action: 'admin-login', hostname: 'portfolio.example', challenge_ts: new Date().toISOString() }));
  const login = await handleVercel(request('/api/admin/login', { password: f.password, turnstileToken: 'provider-issued-test-token' }), f.settings, f.database);
  assert.equal(login.status, 200);
  const cookie = login.headers.get('Set-Cookie')!;
  assert.match(cookie, /^__Host-portfolio-admin=.*HttpOnly; SameSite=Strict; Max-Age=3600; Secure$/);
  assert.equal((await handleVercel(request('/api/admin/inquiries', undefined, { Cookie: cookie }), f.settings, f.database)).status, 200);
  assert.equal((await handleVercel(request('/api/admin/logout', {}, { Cookie: cookie }), f.settings, f.database)).status, 200);
  assert.equal((await handleVercel(request('/api/admin/inquiries', undefined, { Cookie: cookie }), f.settings, f.database)).status, 401);
});
test('daily maintenance needs the cron secret and removes expired encrypted data and sessions', async t => {
  const f = await fixture(t);
  await f.database.prepare("INSERT INTO contact_inquiries VALUES ('expired', 1, '{}')").run();
  await f.database.prepare("INSERT INTO admin_sessions VALUES ('expired', 'credential', 1)").run();
  assert.equal((await handleVercel(request('/api/maintenance'), f.settings, f.database)).status, 401);
  const response = await handleVercel(request('/api/maintenance', undefined, { Authorization: `Bearer ${f.settings.CRON_SECRET}` }), f.settings, f.database);
  assert.equal(response.status, 200);
  assert.equal((await f.database.prepare('SELECT COUNT(*) AS count FROM contact_inquiries').first<{ count: number }>())?.count, 0);
  assert.equal((await f.database.prepare('SELECT COUNT(*) AS count FROM admin_sessions').first<{ count: number }>())?.count, 0);
});
test('production database configuration rejects local files and insecure endpoints', () => {
  for (const url of ['file:/tmp/private.db', 'http://db.example', 'libsql://localhost', 'libsql://user:password@test.turso.io']) {
    assert.throws(() => productionDatabase({ TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: 'private-test-token' }));
  }
});
