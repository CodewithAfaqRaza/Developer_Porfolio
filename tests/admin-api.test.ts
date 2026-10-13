import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { adminHash, handleAdmin, type AdminEnv } from '../server/admin.ts';
import { handleContact, type ContactDatabase, type ContactStatement, type ContactResult } from '../server/contact.ts';

class Statement implements ContactStatement {
  values: (string | number | null)[] = [];
  readonly db: DatabaseSync;
  readonly sql: string;
  constructor(db: DatabaseSync, sql: string) { this.db = db; this.sql = sql; }
  bind(...values: (string | number | null)[]) { this.values = values; return this; }
  execute(): ContactResult { return { success: true, results: this.db.prepare(this.sql).all(...this.values) }; }
  async run() { return this.execute(); }
  async first<T>() { return (this.db.prepare(this.sql).get(...this.values) as T | undefined) || null; }
}
class Database implements ContactDatabase {
  sqlite = new DatabaseSync(':memory:');
  constructor() { for (const file of ['0001_contact.sql', '0002_admin.sql', '0003_notifications.sql']) this.sqlite.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf8')); }
  prepare(sql: string) { return new Statement(this.sqlite, sql); }
  async batch(statements: ContactStatement[]) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try { const results = statements.map(s => (s as Statement).execute()); this.sqlite.exec('COMMIT'); return results; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}
const origin = 'http://127.0.0.1:5173';
async function fixture() {
  const db = new Database();
  const password = randomBytes(32).toString('base64url');
  const env: AdminEnv = { DB: db, SITE_ORIGIN: origin, LOCAL_DEVELOPMENT: true,
    DATA_ENCRYPTION_KEY: randomBytes(32).toString('base64'), RATE_LIMIT_SECRET: randomBytes(32).toString('hex'), ADMIN_PASSWORD_HASH: await adminHash(password) };
  const request = (path: string, body?: object, cookie?: string, extra: Record<string, string> = {}) => new Request(`${origin}/api/admin/${path}`, {
    method: body ? 'POST' : 'GET', headers: { ...(body ? { Origin: origin, 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...extra },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const login = () => handleAdmin(request('login', { password, turnstileToken: 'local-development-only' }), env);
  return { db, password, env, request, login };
}
test('admin requires configuration and authentication; no data leaks', async () => {
  const f = await fixture();
  assert.equal((await handleAdmin(f.request('inquiries'), f.env)).status, 401);
  assert.equal((await handleAdmin(f.request('session'), { ...f.env, ADMIN_PASSWORD_HASH: undefined })).status, 503);
  const response = await handleAdmin(f.request('session'), f.env);
  assert.equal((await response.json()).authenticated, false);
  assert.equal(response.headers.get('Cache-Control'), 'no-store, private');
});
test('login creates opaque HttpOnly cookie and hashes its token at rest; logout revokes it', async () => {
  const f = await fixture();
  const response = await f.login();
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie')!;
  assert.match(cookie, /HttpOnly; SameSite=Strict; Max-Age=3600/);
  const token = cookie.split(';')[0].split('=')[1];
  const stored = f.db.sqlite.prepare('SELECT token_hash FROM admin_sessions').get()!;
  assert.notEqual(stored.token_hash, token);
  assert.equal(stored.token_hash, await adminHash(token));
  assert.equal((await handleAdmin(f.request('inquiries', undefined, cookie), f.env)).status, 200);
  assert.equal((await handleAdmin(f.request('logout', {}, cookie), f.env)).status, 200);
  assert.equal((await handleAdmin(f.request('inquiries', undefined, cookie), f.env)).status, 401);
});
test('expired, forged and rotated credential sessions cannot read data', async () => {
  const f = await fixture(); const cookie = (await f.login()).headers.get('Set-Cookie')!;
  assert.equal((await handleAdmin(f.request('inquiries', undefined, 'portfolio-admin=' + 'a'.repeat(64)), f.env)).status, 401);
  assert.equal((await handleAdmin(f.request('inquiries', undefined, cookie), { ...f.env, ADMIN_PASSWORD_HASH: await adminHash('new credential') })).status, 401);
  f.db.sqlite.exec('UPDATE admin_sessions SET expires_at = 1');
  assert.equal((await handleAdmin(f.request('inquiries', undefined, cookie), f.env)).status, 401);
});
test('cross-origin login/logout/read blocked; unknown method rejected', async () => {
  const f = await fixture();
  assert.equal((await handleAdmin(f.request('login', { password: f.password }, undefined, { Origin: 'https://evil.example' }), f.env)).status, 403);
  assert.equal((await handleAdmin(f.request('session', undefined, undefined, { 'Sec-Fetch-Site': 'cross-site' }), f.env)).status, 403);
  assert.equal((await handleAdmin(f.request('login'), f.env)).status, 405);
  const missingOrigin = f.request('logout', {}); missingOrigin.headers.delete('Origin');
  assert.equal((await handleAdmin(missingOrigin, f.env)).status, 403);
});
test('failed logins rate limited persistently; malformed and oversized body fail', async () => {
  const f = await fixture();
  assert.equal((await handleAdmin(f.request('login', { password: 'a'.repeat(5000) }), f.env)).status, 401);
  for (let i = 0; i < 4; i++) assert.equal((await handleAdmin(f.request('login', { password: 'a'.repeat(43), turnstileToken: 'local-development-only' }), f.env)).status, 401);
  assert.equal((await f.login()).status, 429);
});
test('encrypted contact submission appears only to authenticated owner', async () => {
  const f = await fixture();
  const submission = await handleContact(new Request(`${origin}/api/contact`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({
    name: 'Test Owner Inquiry', email: 'test@example.com', country: 'PK', description: 'Build a Drupal event website with API integrations.', budget: '1000-5000', consent: true, website: '', turnstileToken: 'local-development-only',
  }) }), f.env);
  assert.equal(submission.status, 201);
  const raw = f.db.sqlite.prepare('SELECT payload FROM contact_inquiries').get()!;
  assert.ok(!String(raw.payload).includes('test@example.com'));
  const cookie = (await f.login()).headers.get('Set-Cookie')!;
  const response = await handleAdmin(f.request('inquiries', undefined, cookie), f.env);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.inquiries[0].details.email, 'test@example.com');
  assert.ok(!('phone' in data.inquiries[0].details));
  assert.ok(!('kind' in data.inquiries[0].details));
  assert.equal(data.next, null);
  assert.equal((await handleAdmin(f.request('inquiries?before=bad&id=bad', undefined, cookie), f.env)).status, 400);
});
test('production login uses CAPTCHA action and secure cookie; rejects local bypass', async t => {
  const f = await fixture();
  const prodOrigin = 'https://portfolio.example';
  const env = { ...f.env, SITE_ORIGIN: prodOrigin, LOCAL_DEVELOPMENT: false, TURNSTILE_SITE_KEY: 'real-public-key', TURNSTILE_SECRET_KEY: 'real-secret-key' };
  let captchaAction = 'contact';
  t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, action: captchaAction, hostname: 'portfolio.example', challenge_ts: new Date().toISOString() }));
  const request = (token: string) => new Request(`${prodOrigin}/api/admin/login`, { method: 'POST', headers: { Origin: prodOrigin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.1' }, body: JSON.stringify({ password: f.password, turnstileToken: token }) });
  assert.equal((await handleAdmin(request('local-development-only'), env)).status, 401);
  assert.equal((await handleAdmin(request('valid-provider-token'), env)).status, 401);
  captchaAction = 'admin-login';
  const response = await handleAdmin(request('valid-provider-token'), env);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Set-Cookie')!, /^__Host-portfolio-admin=.*; Secure$/);
});

test('pagination handles tied timestamps without duplicates and excludes expired inquiries', async () => {
  const f = await fixture();
  const key = await crypto.subtle.importKey('raw', Buffer.from(f.env.DATA_ENCRYPTION_KEY!, 'base64'), 'AES-GCM', false, ['encrypt']);
  const now = Date.now();
  const encoder = new TextEncoder();
  for (let i = 0; i < 28; i++) {
    const id = randomUUID(); const createdAt = i === 27 ? 1 : now;
    const iv = randomBytes(12);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(`${id}:${createdAt}`) }, key, encoder.encode(JSON.stringify({ name: `Inquiry ${i}`, email: `test${i}@example.com` })));
    f.db.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run(id, createdAt, JSON.stringify({ v: 1, iv: iv.toString('base64'), ciphertext: Buffer.from(ciphertext).toString('base64') }));
  }
  const cookie = (await f.login()).headers.get('Set-Cookie')!;
  const first = await (await handleAdmin(f.request('inquiries', undefined, cookie), f.env)).json();
  assert.equal(first.inquiries.length, 25);
  assert.ok(first.next);
  const second = await (await handleAdmin(f.request(`inquiries?before=${first.next.before}&id=${first.next.id}`, undefined, cookie), f.env)).json();
  assert.equal(second.inquiries.length, 2);
  assert.equal(second.next, null);
  assert.equal(new Set([...first.inquiries, ...second.inquiries].map(r => r.id)).size, 27);
});

test('global login cap stops unbounded per-client rate rows before CAPTCHA', async () => {
  const f = await fixture();
  for (let i = 0; i < 50; i++) {
    const request = f.request('login', { password: 'wrong' });
    await handleAdmin(request, f.env);
  }
  const before = f.db.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').get()!.count;
  assert.equal((await f.login()).status, 429);
  assert.equal(f.db.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').get()!.count, before);
});
