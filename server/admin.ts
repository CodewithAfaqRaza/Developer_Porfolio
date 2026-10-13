import { decryptInquiryPayload, INQUIRY_RETENTION_DAYS, type ContactEnv } from './contact.ts';

export interface AdminEnv extends ContactEnv { ADMIN_PASSWORD_HASH?: string }
const encoder = new TextEncoder();
const HOUR = 3_600_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function adminHash(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))), n => n.toString(16).padStart(2, '0')).join('');
}
function reply(body: object, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store, private',
    'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", ...headers,
  }});
}
function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
function cookieName(env: AdminEnv) { return env.LOCAL_DEVELOPMENT ? 'portfolio-admin' : '__Host-portfolio-admin'; }
function cookie(env: AdminEnv, token: string, age: number) {
  return `${cookieName(env)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${env.LOCAL_DEVELOPMENT ? '' : '; Secure'}`;
}
async function session(request: Request, env: AdminEnv): Promise<string | null> {
  const token = request.headers.get('Cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${cookieName(env)}=`))?.split('=')[1];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const hash = await adminHash(token);
  const row = await env.DB!.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND credential_hash = ? AND expires_at > ?').bind(hash, env.ADMIN_PASSWORD_HASH!, Date.now()).first();
  return row ? hash : null;
}
async function limited(env: AdminEnv, key: string, limit: number, window: number) {
  const expires = (Math.floor(Date.now() / window) + 1) * window;
  const result = await env.DB!.batch([env.DB!.prepare(`INSERT INTO contact_rate_limits (key, attempts, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = MIN(attempts + 1, 101) RETURNING attempts`).bind(`${key}:${expires}`, expires)]);
  if (!result[0]?.success || !result[0].results?.[0]) throw new Error('Rate limit unavailable');
  return Number(result[0].results[0].attempts) > limit;
}
async function ipKey(request: Request, env: AdminEnv) {
  const ip = env.LOCAL_DEVELOPMENT ? 'local' : request.headers.get('CF-Connecting-IP');
  if (!ip) throw new Error('Missing client IP');
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.ADMIN_PASSWORD_HASH!), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(ip))), n => n.toString(16).padStart(2, '0')).join('');
}
async function validCaptcha(token: unknown, env: AdminEnv): Promise<boolean> {
  if (env.LOCAL_DEVELOPMENT) return token === 'local-development-only';
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048 || token === 'local-development-only') return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(5000), redirect: 'error',
  });
  if (!response.ok) return false;
  const data = await response.json() as Record<string, unknown>;
  const time = typeof data.challenge_ts === 'string' ? Date.parse(data.challenge_ts) : NaN;
  return data.success === true && data.action === 'admin-login' && data.hostname === new URL(env.SITE_ORIGIN!).hostname
    && Number.isFinite(time) && Date.now() - time < 300_000 && time < Date.now() + 60_000;
}
async function loginBody(request: Request): Promise<Record<string, unknown> | null> {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return null;
  if (Number(request.headers.get('Content-Length') || 0) > 4096) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let size = 0;
  const chunks: Uint8Array[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const read = async () => {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 4096) { void reader.cancel(); return null; }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const data: unknown = JSON.parse(new TextDecoder().decode(bytes));
      return data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : null;
    };
    return await Promise.race([read(), new Promise<null>(resolve => { timer = setTimeout(() => { void reader.cancel(); resolve(null); }, 5000); })]);
  } catch { return null; } finally { clearTimeout(timer); }
}
export async function handleAdmin(request: Request, env: AdminEnv): Promise<Response> {
  try {
    const url = new URL(request.url);
    const local = env.LOCAL_DEVELOPMENT === true;
    if (!env.DB || !/^[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH || '') || !env.DATA_ENCRYPTION_KEY
      || !env.SITE_ORIGIN || url.origin !== env.SITE_ORIGIN
      || (!local && (url.protocol !== 'https:' || !env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY
        || /^[123]x/.test(env.TURNSTILE_SITE_KEY) || /^[123]x/.test(env.TURNSTILE_SECRET_KEY)))) {
      return reply({ error: 'Admin login is not configured. Run the admin setup command or configure production secrets.' }, 503);
    }
    if (request.headers.get('Sec-Fetch-Site') === 'cross-site'
      || (request.headers.has('Origin') && request.headers.get('Origin') !== env.SITE_ORIGIN)) return reply({ error: 'Request not allowed.' }, 403);
    const route = url.pathname;
    const expected = ['/api/admin/login', '/api/admin/logout'].includes(route) ? 'POST' : 'GET';
    if (request.method !== expected) return reply({ error: 'Method not allowed.' }, 405, { Allow: expected });
    if (expected === 'POST' && request.headers.get('Origin') !== env.SITE_ORIGIN) return reply({ error: 'Request not allowed.' }, 403);
    if (route === '/api/admin/login') {
      const global = await limited(env, 'admin-login:global', 50, HOUR);
      if (global) return reply({ error: 'Too many login attempts. Try again later.' }, 429, { 'Retry-After': '3600' });
      const ip = await ipKey(request, env);
      const perIp = await limited(env, `admin-login:${ip}`, 5, 900_000);
      if (perIp) return reply({ error: 'Too many login attempts. Try again later.' }, 429, { 'Retry-After': '900' });
      const body = await loginBody(request);
      if (!body || Object.keys(body).some(k => !['password', 'turnstileToken'].includes(k))
        || typeof body.password !== 'string' || body.password.length > 128 || body.password.length < 32) return reply({ error: 'Login failed. Check your password and verification.' }, 401);
      const verified = await validCaptcha(body.turnstileToken, env);
      const correct = equal(await adminHash(body.password), env.ADMIN_PASSWORD_HASH!);
      if (!verified || !correct) return reply({ error: 'Login failed. Check your password and verification.' }, 401);
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
      const stored = await env.DB.batch([
        env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ? OR credential_hash != ?').bind(Date.now(), env.ADMIN_PASSWORD_HASH!),
        env.DB.prepare('INSERT INTO admin_sessions (token_hash, credential_hash, expires_at) VALUES (?, ?, ?)').bind(await adminHash(token), env.ADMIN_PASSWORD_HASH!, Date.now() + HOUR),
      ]);
      if (stored.some(r => !r.success)) throw new Error('Session persistence failed');
      return reply({ authenticated: true }, 200, { 'Set-Cookie': cookie(env, token, 3600) });
    }
    const authenticated = await session(request, env);
    if (route === '/api/admin/session') return reply({ authenticated: Boolean(authenticated), local, siteKey: local ? null : env.TURNSTILE_SITE_KEY });
    if (!authenticated) return reply({ error: 'Please log in.' }, 401);
    if (route === '/api/admin/logout') {
      const result = await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(authenticated).run();
      if (!result.success) throw new Error('Logout failed');
      return reply({ authenticated: false }, 200, { 'Set-Cookie': cookie(env, '', 0) });
    }
    if (route !== '/api/admin/inquiries') return reply({ error: 'Not found.' }, 404);
    if (await limited(env, `admin-read:${authenticated}`, 60, 60_000)) return reply({ error: 'Please wait before refreshing again.' }, 429);
    const oldest = Date.now() - INQUIRY_RETENTION_DAYS * 86_400_000;
    const before = url.searchParams.get('before');
    const id = url.searchParams.get('id');
    if ((before === null) !== (id === null) || (before !== null && (!/^\d{1,16}$/.test(before) || !UUID.test(id!)))) return reply({ error: 'Invalid page.' }, 400);
    const statement = before === null
      ? env.DB.prepare('SELECT id, created_at, payload FROM contact_inquiries WHERE created_at > ? ORDER BY created_at DESC, id DESC LIMIT 26').bind(oldest)
      : env.DB.prepare('SELECT id, created_at, payload FROM contact_inquiries WHERE created_at > ? AND (created_at < ? OR (created_at = ? AND id < ?)) ORDER BY created_at DESC, id DESC LIMIT 26').bind(oldest, Number(before), Number(before), id!);
    const result = await statement.run();
    if (!result.success || !result.results) throw new Error('Read failed');
    const rows = result.results.slice(0, 25);
    const inquiries = await Promise.all(rows.map(async row => ({ id: row.id, createdAt: row.created_at,
      details: await decryptInquiryPayload(String(row.payload), env.DATA_ENCRYPTION_KEY!, String(row.id), Number(row.created_at)),
    })));
    const last = rows.at(-1);
    return reply({ inquiries, next: result.results.length > 25 && last ? { before: last.created_at, id: last.id } : null });
  } catch { return reply({ error: 'The dashboard is temporarily unavailable. Try again shortly.' }, 503); }
}
