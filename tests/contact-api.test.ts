import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { test, type TestContext } from 'node:test';
import retentionWorker from '../maintenance/retention-worker.ts';
import { deliverNotifications } from '../server/notifications.ts';
import { secureResponse } from '../server/site-security.ts';
import {
  decryptInquiryPayload,
  handleConfig,
  handleContact,
  LOCAL_TURNSTILE_TOKEN,
  type ContactDatabase,
  type ContactEnv,
  type ContactResult,
  type ContactStatement,
} from '../server/contact.ts';

// Exercise the production SQL with SQLite rather than returning canned D1 rows.
class SqliteStatement implements ContactStatement {
  values: SQLInputValue[] = [];
  readonly database: DatabaseSync;
  readonly sql: string;

  constructor(database: DatabaseSync, sql: string) {
    this.database = database;
    this.sql = sql;
  }

  bind(...values: unknown[]): ContactStatement {
    this.values = values.map((value) => {
      assert.ok(
        value === null || typeof value === 'string' || typeof value === 'number',
        'Contact SQL binds only supported scalar values',
      );
      return value as SQLInputValue;
    });
    return this;
  }

  execute(): ContactResult {
    const results = this.database.prepare(this.sql).all(...this.values);
    const changed = this.database.prepare('SELECT changes() AS changes').get();
    return { success: true, results, meta: { changes: Number(changed?.changes ?? 0) } };
  }

  async run(): Promise<ContactResult> {
    return this.execute();
  }

  async first<T>(): Promise<T | null> {
    return (this.database.prepare(this.sql).get(...this.values) as T | undefined) ?? null;
  }
}

class SqliteDatabase implements ContactDatabase {
  readonly sqlite = new DatabaseSync(':memory:');

  constructor() {
    this.sqlite.exec(readFileSync(new URL('../migrations/0001_contact.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../migrations/0002_admin.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../migrations/0003_notifications.sql', import.meta.url), 'utf8'));
  }

  prepare(sql: string): ContactStatement {
    return new SqliteStatement(this.sqlite, sql);
  }

  async batch(statements: ContactStatement[]): Promise<ContactResult[]> {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map((statement) => {
        assert.ok(statement instanceof SqliteStatement);
        return statement.execute();
      });
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  inquiries(): Record<string, unknown>[] {
    return this.sqlite.prepare('SELECT * FROM contact_inquiries ORDER BY created_at').all();
  }
}

const localOrigin = 'http://127.0.0.1:5173';
const productionOrigin = 'https://portfolio.example';
const encryptionKey = Buffer.from(new Uint8Array(32).fill(42)).toString('base64');
const publicSiteKey = '0x4AAAAAAAZ8jQ9v4S7dqWnk';

test('simplified form saves and emails the five contact fields without inventing phone or inquiry type', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { RESEND_API_KEY: 're_test_private_notification_key', NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  const emails: Record<string, unknown>[] = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    if (String(url).includes('siteverify')) return Response.json(verifiedCaptcha());
    emails.push(JSON.parse(String(init.body))); return Response.json({ id: 'simplified-email-id' });
  });
  const body = validBody({ phone: undefined, kind: undefined, turnstileToken: 'browser-token' });
  const response = await handleContact(request(body, { production: true }), env);
  assert.equal(response.status, 201);
  const row = database.inquiries()[0];
  const details = await decryptInquiryPayload(String(row.payload), encryptionKey, String(row.id), Number(row.created_at)) as Record<string, unknown>;
  assert.ok(!('phone' in details)); assert.ok(!('kind' in details));
  assert.equal(emails.length, 1); assert.equal(emails[0].reply_to, body.email.trim());
  assert.ok(String(emails[0].text).includes(body.description));
  assert.ok(!String(emails[0].text).includes('Phone:')); assert.ok(!String(emails[0].text).includes('Inquiry type:'));
});

test('saved production inquiry emails every field to the owner and sets the visitor as Reply-To', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { RESEND_API_KEY: 're_test_private_notification_key', NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  const emails: RequestInit[] = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    if (String(url).includes('siteverify')) return Response.json(verifiedCaptcha());
    assert.equal(String(url), 'https://api.resend.com/emails'); emails.push(init);
    return Response.json({ id: 'provider-message-id' });
  });
  const response = await handleContact(request(validBody({ turnstileToken: 'verified-browser-token' }), { production: true }), env);
  assert.equal(response.status, 201);
  const receipt = await response.json();
  const { reference } = receipt;
  assert.equal(emails.length, 1);
  const email = JSON.parse(String(emails[0].body));
  assert.deepEqual(email.to, ['owner@gmail.com']);
  assert.equal(email.from, 'onboarding@resend.dev');
  assert.equal(email.reply_to, 'PERSON@example.com');
  assert.ok(email.text.includes(reference)); assert.ok(email.text.includes(productionOrigin + '/admin'));
  for (const value of ['Email: PERSON@example.com', 'Name: Test Collaborator', 'Phone: +92 300 1234567',
    'Country: Pakistan (PK)', 'Inquiry type: Project', 'Budget: $5,000–$10,000', 'Budget currency: USD',
    'Consent to store details and respond: Yes', validBody().description]) assert.ok(email.text.includes(value), value);
  assert.equal(email.html, undefined, 'Visitor content is plain text, never interpreted as HTML');
  assert.deepEqual(receipt, { ok: true, reference });
  await deliverNotifications(database, env, reference);
  assert.equal(emails.length, 1);
  assert.ok(database.sqlite.prepare('SELECT sent_at FROM contact_notifications').get()?.sent_at);
});

test('email supports optional phone and collaboration details; injected email headers cannot send', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { RESEND_API_KEY: 're_test_private_notification_key', NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  const emails: Record<string, unknown>[] = [];
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    if (String(url).includes('siteverify')) return Response.json(verifiedCaptcha());
    emails.push(JSON.parse(String(init.body))); return Response.json({ id: 'email-id' });
  });
  const bad = await handleContact(request(validBody({ email: 'visitor@gmail.com\r\nBcc: attacker@example.com', turnstileToken: 'browser-token' }), { production: true }), env);
  assert.equal(bad.status, 422); assert.equal(emails.length, 0);
  const description = 'First requirement.\n<script>alert("inert text")</script>\nSecond requirement.';
  const response = await handleContact(request(validBody({ phone: '', kind: 'collaboration', email: 'visitor@gmail.com', description, budget: 'discuss', turnstileToken: 'browser-token' }), { production: true }), env);
  assert.equal(response.status, 201); assert.equal(emails.length, 1);
  assert.equal(emails[0].reply_to, 'visitor@gmail.com');
  assert.ok(String(emails[0].text).includes('Phone: Not provided'));
  assert.ok(String(emails[0].text).includes('Inquiry type: Collaboration'));
  assert.ok(String(emails[0].text).includes(description));
  assert.equal(emails[0].html, undefined);
  assert.equal(database.inquiries().length, 1);
});

test('notification retries fail safely when authenticated decryption is unavailable', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  t.mock.method(globalThis, 'fetch', async () => Response.json(verifiedCaptcha()));
  const response = await handleContact(request(validBody({ turnstileToken: 'browser-token' }), { production: true }), env);
  assert.equal(response.status, 201);
  database.sqlite.exec("UPDATE contact_inquiries SET payload = '{}'");
  env.RESEND_API_KEY = 're_test_private_notification_key'; let sends = 0;
  t.mock.method(globalThis, 'fetch', async () => { sends++; return Response.json({ id: 'unexpected' }); });
  await deliverNotifications(database, env);
  assert.equal(sends, 0);
  const row = database.sqlite.prepare('SELECT sent_at, last_error FROM contact_notifications').get();
  assert.equal(row?.sent_at, null); assert.equal(row?.last_error, 'payload-unavailable');
});

test('notification failure preserves successful receipt and retries with stable idempotency', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { RESEND_API_KEY: 're_test_private_notification_key', NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  const keys: string[] = []; let fail = true;
  t.mock.method(globalThis, 'fetch', async (url: unknown, init: RequestInit) => {
    if (String(url).includes('siteverify')) return Response.json(verifiedCaptcha());
    keys.push(new Headers(init.headers).get('Idempotency-Key')!);
    return fail ? Response.json({ message: 'private provider detail' }, { status: 429 }) : Response.json({ id: 'retry-message' });
  });
  const response = await handleContact(request(validBody({ turnstileToken: 'verified-browser-token' }), { production: true }), env);
  assert.equal(response.status, 201); assert.equal(database.inquiries().length, 1);
  assert.equal(database.sqlite.prepare('SELECT last_error FROM contact_notifications').get()?.last_error, 'provider-429');
  await deliverNotifications(database, env); assert.equal(keys.length, 1, 'Retry respects backoff');
  database.sqlite.exec('UPDATE contact_notifications SET next_attempt_at = 1'); fail = false;
  await Promise.all([deliverNotifications(database, env), deliverNotifications(database, env)]);
  assert.equal(keys.length, 2); assert.equal(keys[0], keys[1]);
  assert.ok(database.sqlite.prepare('SELECT sent_at FROM contact_notifications').get()?.sent_at);
});

test('queue insertion and inquiry storage are atomic; local submissions never send mail', async t => {
  const { database, env } = fixture(t, true);
  Object.assign(env, { RESEND_API_KEY: 're_test_private_notification_key', NOTIFICATION_TO: 'owner@gmail.com', NOTIFICATION_FROM: 'onboarding@resend.dev' });
  database.sqlite.exec("CREATE TRIGGER block_notifications BEFORE INSERT ON contact_notifications BEGIN SELECT RAISE(ABORT, 'queue unavailable'); END");
  let sends = 0;
  t.mock.method(globalThis, 'fetch', async (url: unknown) => { if (!String(url).includes('siteverify')) sends++; return Response.json(verifiedCaptcha()); });
  assert.equal((await handleContact(request(validBody({ turnstileToken: 'verified-browser-token' }), { production: true }), env)).status, 503);
  assert.equal(database.inquiries().length, 0); assert.equal(sends, 0);
  const local = fixture(t); Object.assign(local.env, env, { LOCAL_DEVELOPMENT: true, SITE_ORIGIN: localOrigin, DB: local.database });
  assert.equal((await handleContact(request(), local.env)).status, 201);
  assert.equal(sends, 0); assert.equal(local.database.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_notifications').get()?.count, 0);
});

function fixture(t: TestContext, production = false) {
  const database = new SqliteDatabase();
  t.after(() => database.sqlite.close());
  const env: ContactEnv = {
    DB: database,
    SITE_ORIGIN: production ? productionOrigin : localOrigin,
    DATA_ENCRYPTION_KEY: encryptionKey,
    RATE_LIMIT_SECRET: 'test-rate-limit-hmac-secret-with-at-least-32-characters',
    LOCAL_DEVELOPMENT: !production,
    ...(production
      ? { TURNSTILE_SITE_KEY: publicSiteKey, TURNSTILE_SECRET_KEY: 'production-secret-for-mocked-verification' }
      : {}),
  };
  return { database, env };
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: '  Test Collaborator  ',
    email: '  PERSON@example.com  ',
    phone: '+92 300 1234567',
    country: 'PK',
    kind: 'project',
    description: 'I would like to discuss a Drupal project and an API integration.',
    budget: '5000-10000',
    consent: true,
    website: '',
    turnstileToken: LOCAL_TURNSTILE_TOKEN,
    ...overrides,
  };
}

function request(
  body: unknown = validBody(),
  options: { production?: boolean; origin?: string; ip?: string; headers?: Record<string, string> } = {},
) {
  const origin = options.production ? productionOrigin : localOrigin;
  return new Request(`${origin}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: options.origin ?? origin,
      'Sec-Fetch-Site': 'same-origin',
      ...(options.production ? { 'CF-Connecting-IP': options.ip ?? '203.0.113.10' } : {}),
      ...options.headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function withSiteverify(
  t: TestContext,
  response: Record<string, unknown> | Error,
  callback: (calls: { input: RequestInfo | URL; init?: RequestInit }[]) => Promise<void>,
) {
  const originalFetch = globalThis.fetch;
  const calls: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    if (response instanceof Error) throw response;
    return Response.json(response);
  };
  t.after(() => { globalThis.fetch = originalFetch; });
  try {
    await callback(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function verifiedCaptcha(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    action: 'contact',
    hostname: 'portfolio.example',
    challenge_ts: new Date().toISOString(),
    ...overrides,
  };
}

test('valid inquiries persist as authenticated ciphertext, normalize fields, and never store a raw IP', async (t) => {
  const { env, database } = fixture(t);
  const response = await handleContact(request(), env);
  assert.ok(response.ok, `Expected successful submission, received ${response.status}: ${await response.text()}`);
  const rows = database.inquiries();
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(typeof row.id, 'string');
  assert.equal(typeof row.created_at, 'number');
  assert.equal(typeof row.payload, 'string');
  const ciphertext = JSON.parse(String(row.payload)) as Record<string, unknown>;
  assert.equal(ciphertext.v, 1);
  assert.ok(ciphertext.iv);
  assert.ok(ciphertext.ciphertext);
  const decrypted = await decryptInquiryPayload(String(row.payload), encryptionKey, String(row.id), Number(row.created_at)) as Record<string, unknown>;
  assert.equal(decrypted.name, 'Test Collaborator');
  assert.equal(decrypted.email, 'PERSON@example.com');
  assert.equal(decrypted.country, 'PK');
  assert.equal(decrypted.budget, '5000-10000');
  assert.equal(decrypted.consent, true);
  const storedText = JSON.stringify([
    ...rows,
    ...database.sqlite.prepare('SELECT * FROM contact_rate_limits').all(),
  ]);
  for (const privateValue of ['Test Collaborator', 'PERSON@example.com', '+92', 'Drupal project', '127.0.0.1']) {
    assert.ok(!storedText.includes(privateValue), `${privateValue} must not be stored in plaintext`);
  }
  await assert.rejects(() => decryptInquiryPayload(String(row.payload), encryptionKey, 'tampered-id', Number(row.created_at)));
  const wrongKey = Buffer.from(new Uint8Array(32).fill(7)).toString('base64');
  await assert.rejects(() => decryptInquiryPayload(String(row.payload), wrongKey, String(row.id), Number(row.created_at)));
  assert.ok(response.headers.get('Cache-Control')?.includes('no-store'));
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('phone is optional and markup remains inert data inside the encrypted payload', async (t) => {
  const { env, database } = fixture(t);
  const body = validBody({ phone: undefined, description: '<script>alert("stored-data")</script> I need a new website.' });
  const response = await handleContact(request(body), env);
  assert.ok(response.ok);
  const row = database.inquiries()[0];
  const decrypted = await decryptInquiryPayload(String(row.payload), encryptionKey, String(row.id), Number(row.created_at)) as Record<string, unknown>;
  assert.ok(!decrypted.phone);
  assert.equal(decrypted.description, body.description);
  assert.ok(!JSON.stringify(await response.json()).includes('<script>'));
});

test('rejects malformed JSON, unsupported shape, unknown fields, wrong content type, and oversized payloads', async (t) => {
  const cases: { body: unknown; headers?: Record<string, string> }[] = [
    { body: '{"name":' },
    { body: null },
    { body: [] },
    { body: validBody({ admin: true }) },
    { body: validBody(), headers: { 'Content-Type': 'text/plain' } },
    { body: validBody({ description: 'A'.repeat(70_000) }) },
    { body: validBody(), headers: { 'Content-Length': '1000000' } },
  ];
  for (const item of cases) {
    const { env, database } = fixture(t);
    const response = await handleContact(request(item.body, { headers: item.headers }), env);
    assert.ok([400, 413, 415].includes(response.status), `Unexpected status ${response.status}`);
    assert.equal(database.inquiries().length, 0);
  }
});

test('server validates email, country, description, inquiry type, budget, phone, and affirmative consent', async (t) => {
  const cases = [
    { name: 'A' },
    { email: 'invalid-email' },
    { email: '.person@example.com' },
    { email: 'person.@example.com' },
    { email: 'per..son@example.com' },
    { email: 'person@example.com\r\nBcc:someone@example.com' },
    { country: 'XX' },
    { country: 'Pakistan' },
    { description: 'Short' },
    { description: 'A'.repeat(2001) },
    { kind: 'administrator' },
    { budget: 'free' },
    { phone: '<script>alert(1)</script>' },
    { consent: false },
    { consent: undefined },
    { consent: 'true' },
  ];
  for (const overrides of cases) {
    const { env, database } = fixture(t);
    const response = await handleContact(request(validBody(overrides)), env);
    assert.equal(response.status, 422, `Invalid field ${JSON.stringify(overrides)} must be rejected`);
    assert.equal(database.inquiries().length, 0);
  }
});

test('honeypot submissions, cross-origin requests, and unsafe methods cannot create records', async (t) => {
  const { env, database } = fixture(t);
  assert.equal((await handleContact(request(validBody({ website: 'https://spam.example' })), env)).status, 400);
  assert.equal((await handleContact(request(validBody(), { origin: 'https://attacker.example' }), env)).status, 403);
  assert.equal((await handleContact(request(validBody(), { headers: { 'Sec-Fetch-Site': 'cross-site' } }), env)).status, 403);
  const noOrigin = request();
  noOrigin.headers.delete('Origin');
  assert.equal((await handleContact(noOrigin, env)).status, 403);
  const getResponse = await handleContact(new Request(`${localOrigin}/api/contact`), env);
  assert.equal(getResponse.status, 405);
  assert.equal(database.inquiries().length, 0);
});

test('production validates CAPTCHA server-side and exposes only public configuration', async (t) => {
  const { env, database } = fixture(t, true);
  await withSiteverify(t, verifiedCaptcha(), async (calls) => {
    const response = await handleContact(request(validBody({ turnstileToken: 'real-browser-issued-token' }), { production: true }), env);
    assert.ok(response.ok, `Production submission failed with ${response.status}: ${await response.text()}`);
    assert.equal(database.inquiries().length, 1);
    assert.equal(calls.length, 1);
    assert.equal(String(calls[0].input), 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(calls[0].init?.method, 'POST');
    const verificationBody = JSON.parse(String(calls[0].init?.body)) as Record<string, unknown>;
    assert.equal(verificationBody.secret, env.TURNSTILE_SECRET_KEY);
    assert.equal(verificationBody.response, 'real-browser-issued-token');
    assert.equal(verificationBody.remoteip, '203.0.113.10');
    assert.ok(calls[0].init?.signal, 'Siteverify should have an enforced timeout');
  });
  const config = await handleConfig(new Request(`${productionOrigin}/api/contact-config`), env);
  assert.ok(config.ok);
  const publicConfig = await config.text();
  assert.ok(publicConfig.includes(publicSiteKey));
  for (const secret of [encryptionKey, env.RATE_LIMIT_SECRET, env.TURNSTILE_SECRET_KEY]) {
    assert.ok(!publicConfig.includes(String(secret)));
  }
  const crossOrigin = await handleConfig(new Request(`${productionOrigin}/api/contact-config`, { headers: { Origin: 'https://attacker.example' } }), env);
  assert.equal(crossOrigin.status, 403);
});

test('production fails closed when secrets are absent, keys are test keys, or client requests local CAPTCHA bypass', async (t) => {
  const configurations: Partial<ContactEnv>[] = [
    { TURNSTILE_SITE_KEY: undefined },
    { TURNSTILE_SECRET_KEY: undefined },
    { DATA_ENCRYPTION_KEY: undefined },
    { DATA_ENCRYPTION_KEY: 'not-a-valid-base64-key' },
    { RATE_LIMIT_SECRET: 'short' },
    { TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
    { TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' },
  ];
  for (const configuration of configurations) {
    const { env, database } = fixture(t, true);
    const response = await handleContact(request(validBody({ turnstileToken: 'browser-token' }), { production: true }), { ...env, ...configuration });
    assert.equal(response.status, 503);
    assert.equal(database.inquiries().length, 0);
  }
  const { env, database } = fixture(t, true);
  const bypassResponse = await handleContact(request(validBody(), { production: true }), env);
  assert.ok([400, 422].includes(bypassResponse.status));
  const noIP = request(validBody({ turnstileToken: 'browser-token' }), { production: true });
  noIP.headers.delete('CF-Connecting-IP');
  noIP.headers.set('X-Forwarded-For', '203.0.113.10');
  assert.equal((await handleContact(noIP, env)).status, 503);
  assert.equal(database.inquiries().length, 0);
});

test('CAPTCHA cannot be reused for another host/action or after expiry, and verification errors block persistence', async (t) => {
  const cases: (Record<string, unknown> | Error)[] = [
    verifiedCaptcha({ success: false }),
    verifiedCaptcha({ action: 'another-action' }),
    verifiedCaptcha({ hostname: 'attacker.example' }),
    verifiedCaptcha({ challenge_ts: new Date(Date.now() - 600_000).toISOString() }),
    verifiedCaptcha({ challenge_ts: 'not-a-date' }),
    new Error('Network is unavailable'),
  ];
  for (const verification of cases) {
    const { env, database } = fixture(t, true);
    await withSiteverify(t, verification, async () => {
      const response = await handleContact(request(validBody({ turnstileToken: 'untrusted-token' }), { production: true }), env);
      assert.ok([400, 503].includes(response.status), `Invalid CAPTCHA accepted with ${response.status}`);
      assert.equal(database.inquiries().length, 0);
    });
  }
});

test('slow body streams and CAPTCHA verification enforce deadlines and cannot store an inquiry', async (t) => {
  const local = fixture(t);
  const production = fixture(t, true);
  const slowBody = new Request(`${localOrigin}/api/contact`, {
    method: 'POST',
    headers: { Origin: localOrigin, 'Content-Type': 'application/json' },
    body: new ReadableStream<Uint8Array>({ start() {} }),
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal;
    assert.ok(signal, 'CAPTCHA verification must have a timeout signal');
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  t.after(() => { globalThis.fetch = originalFetch; });
  try {
    const [bodyResponse, captchaResponse] = await Promise.all([
      handleContact(slowBody, local.env),
      handleContact(request(validBody({ turnstileToken: 'slow-verification-token' }), { production: true }), production.env),
    ]);
    assert.equal(bodyResponse.status, 408);
    assert.equal(captchaResponse.status, 503);
    assert.equal(local.database.inquiries().length, 0);
    assert.equal(production.database.inquiries().length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('atomic IP rate limits cap concurrent accepted submissions and recover after the window expires', async (t) => {
  const { env, database } = fixture(t);
  const responses = await Promise.all(Array.from({ length: 12 }, () => handleContact(request(), env)));
  assert.equal(responses.filter((response) => response.ok).length, 5);
  assert.equal(responses.filter((response) => response.status === 429).length, 7);
  assert.equal(database.inquiries().length, 5);
  const limited = responses.find((response) => response.status === 429);
  assert.ok(Number(limited?.headers.get('Retry-After')) > 0);
  database.sqlite.exec("UPDATE contact_rate_limits SET expires_at = 1 WHERE key LIKE 'ip:%'");
  assert.ok((await handleContact(request(), env)).ok);
  assert.equal(database.inquiries().length, 6);
});

test('global rate limit blocks additional IPs before CAPTCHA or database storage', async (t) => {
  const { env, database } = fixture(t, true);
  await withSiteverify(t, verifiedCaptcha(), async (calls) => {
    for (let index = 1; index <= 100; index += 1) {
      const response = await handleContact(request(validBody({ turnstileToken: `token-${index}` }), { production: true, ip: `203.0.113.${index}` }), env);
      assert.ok(response.ok, `Submission ${index} failed with ${response.status}`);
    }
    const blocked = await handleContact(request(validBody({ turnstileToken: 'overflow-token' }), { production: true, ip: '203.0.113.101' }), env);
    assert.equal(blocked.status, 429);
    assert.equal(database.inquiries().length, 100);
    assert.equal(calls.length, 100, 'An exhausted rate limit must not call Siteverify');
    const rateRowsAfterExhaustion = database.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').get()?.count;
    const anotherBlocked = await handleContact(request(validBody({ turnstileToken: 'another-overflow-token' }), { production: true, ip: '203.0.113.102' }), env);
    assert.equal(anotherBlocked.status, 429);
    assert.equal(database.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').get()?.count, rateRowsAfterExhaustion);
  });
});

test('failed storage rolls back retention cleanup and reports failure without a receipt', async (t) => {
  const { env, database } = fixture(t);
  database.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run('old-record', 1, '{}');
  database.sqlite.exec("CREATE TRIGGER block_contact_insert BEFORE INSERT ON contact_inquiries BEGIN SELECT RAISE(ABORT, 'Storage temporarily unavailable'); END");
  const response = await handleContact(request(), env);
  assert.equal(response.status, 503);
  const body = await response.json() as Record<string, unknown>;
  assert.equal(body.ok, false);
  assert.ok(!body.reference);
  const rows = database.inquiries();
  assert.equal(rows.length, 1, 'Failed insert must roll back deletion of the old row in the same transaction');
  assert.equal(rows[0].id, 'old-record');
});

test('successful storage prunes records older than the documented retention period', async (t) => {
  const { env, database } = fixture(t);
  database.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run('old-record', 1, '{}');
  database.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run('recent-record', Date.now(), '{}');
  assert.ok((await handleContact(request(), env)).ok);
  const rows = database.inquiries();
  assert.equal(rows.length, 2);
  assert.ok(rows.some((row) => row.id === 'recent-record'));
  assert.ok(!rows.some((row) => row.id === 'old-record'));
});

test('private scheduled maintenance removes expired data even without incoming inquiries', async (t) => {
  const { database } = fixture(t);
  database.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run('expired-record', 1, '{}');
  database.sqlite.prepare('INSERT INTO contact_inquiries (id, created_at, payload) VALUES (?, ?, ?)').run('current-record', Date.now(), '{}');
  database.sqlite.prepare('INSERT INTO contact_rate_limits (key, attempts, expires_at) VALUES (?, ?, ?)').run('expired-ip-hash', 1, 1);
  database.sqlite.prepare('INSERT INTO contact_rate_limits (key, attempts, expires_at) VALUES (?, ?, ?)').run('current-ip-hash', 1, Date.now() + 60_000);
  database.sqlite.prepare('INSERT INTO admin_sessions (token_hash, credential_hash, expires_at) VALUES (?, ?, ?)').run('expired-session', 'credential', 1);
  database.sqlite.prepare('INSERT INTO admin_sessions (token_hash, credential_hash, expires_at) VALUES (?, ?, ?)').run('current-session', 'credential', Date.now() + 60_000);
  await retentionWorker.scheduled({}, { DB: database });
  assert.deepEqual(database.inquiries().map((row) => row.id), ['current-record']);
  assert.deepEqual(database.sqlite.prepare('SELECT key FROM contact_rate_limits').all().map((row) => row.key), ['current-ip-hash']);
  assert.deepEqual(database.sqlite.prepare('SELECT token_hash FROM admin_sessions').all().map((row) => row.token_hash), ['current-session']);
  assert.equal((await retentionWorker.fetch()).status, 404, 'Maintenance must not expose a public data API');
});

test('site security headers block embedding and preserve a stricter existing API policy', async () => {
  const page = secureResponse(new Response('portfolio'));
  assert.equal(await page.text(), 'portfolio');
  assert.equal(page.headers.get('X-Frame-Options'), 'DENY');
  const policy = page.headers.get('Content-Security-Policy');
  assert.ok(policy?.includes("frame-ancestors 'none'"));
  const scriptPolicy = policy?.split(';').find((directive) => directive.trim().startsWith('script-src'));
  assert.ok(scriptPolicy?.includes('https://challenges.cloudflare.com'));
  assert.ok(!scriptPolicy?.includes("'unsafe-inline'"));
  assert.ok(!scriptPolicy?.includes("'unsafe-eval'"));
  const api = secureResponse(Response.json({ ok: true }, { headers: { 'Content-Security-Policy': "default-src 'none'", 'Cache-Control': 'no-store' } }));
  assert.equal(api.headers.get('Content-Security-Policy'), "default-src 'none'");
  assert.equal(api.headers.get('Cache-Control'), 'no-store');
});

test('database failures cannot return a success message or leak submitted values', async (t) => {
  const { env } = fixture(t);
  const failedDatabase: ContactDatabase = {
    prepare: () => { throw new Error('Private database error containing secret details'); },
    batch: async () => { throw new Error('Private database error containing secret details'); },
  };
  const response = await handleContact(request(), { ...env, DB: failedDatabase });
  assert.ok([500, 503].includes(response.status));
  const errorBody = await response.text();
  assert.ok(!errorBody.includes('secret details'));
  assert.ok(!errorBody.includes('PERSON@example.com'));
});
