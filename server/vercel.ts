import { isIP } from 'node:net';
import { handleAdmin, type AdminEnv } from './admin.ts';
import { handleConfig, handleContact, type ContactDatabase } from './contact.ts';
import { productionDatabase } from './libsql.ts';
import { secureResponse } from './site-security.ts';
import retention from '../maintenance/retention-worker.ts';
import { deliverNotifications } from './notifications.ts';

export type VercelEnvironment = Record<string, string | undefined>;
const routes = new Set(['/api/contact', '/api/contact/config', '/api/admin/session', '/api/admin/login', '/api/admin/logout', '/api/admin/inquiries', '/api/maintenance']);
function reply(status: number, error: string) {
  return secureResponse(Response.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow' } }));
}
function sameSecret(value: string, expected: string) {
  if (value.length !== expected.length) return false;
  let delta = 0; for (let i = 0; i < value.length; i++) delta |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  return delta === 0;
}
/** Only call from Vercel's server entry. Never trust an incoming Cloudflare IP header. */
export async function handleVercel(request: Request, settings: VercelEnvironment, database?: ContactDatabase): Promise<Response> {
  let connection: ReturnType<typeof productionDatabase> | undefined;
  try {
    const target = new URL(request.url);
    // Rewrites forward a route parameter when the runtime reports the destination pathname.
    if (target.pathname === '/api' || target.pathname === '/api/index') {
      const route = target.searchParams.get('route');
      if (route) target.pathname = `/api/${route}`;
      target.searchParams.delete('route');
    }
    if (!routes.has(target.pathname)) return reply(404, 'Not found.');
    if (settings.VERCEL !== '1' || target.origin !== settings.SITE_ORIGIN) return reply(503, 'The production API is not configured for this origin.');
    if (target.pathname === '/api/maintenance') {
      if (request.method !== 'GET') return reply(405, 'Method not allowed.');
      const secret = settings.CRON_SECRET;
      if (!secret || secret.length < 32 || !sameSecret(request.headers.get('Authorization') || '', `Bearer ${secret}`)) return reply(401, 'Not authorized.');
    }
    const headers = new Headers(request.headers);
    headers.delete('CF-Connecting-IP');
    if (request.method === 'POST' && ['/api/contact', '/api/admin/login'].includes(target.pathname)) {
      const ip = request.headers.get('x-vercel-forwarded-for')?.trim();
      if (!ip || !isIP(ip)) return reply(503, 'Client verification is temporarily unavailable.');
      headers.set('CF-Connecting-IP', ip);
    }
    const normalized = new Request(target, { method: request.method, headers,
      ...(!['GET', 'HEAD'].includes(request.method) ? { body: request.body, duplex: 'half' } : {}),
    });
    if (!database) connection = productionDatabase(settings);
    const env: AdminEnv = { DB: database || connection!, SITE_ORIGIN: settings.SITE_ORIGIN,
      TURNSTILE_SITE_KEY: settings.TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY: settings.TURNSTILE_SECRET_KEY,
      DATA_ENCRYPTION_KEY: settings.DATA_ENCRYPTION_KEY, RATE_LIMIT_SECRET: settings.RATE_LIMIT_SECRET,
      ADMIN_PASSWORD_HASH: settings.ADMIN_PASSWORD_HASH, DEPLOYMENT_PLATFORM: 'vercel', LOCAL_DEVELOPMENT: false,
      RESEND_API_KEY: settings.RESEND_API_KEY, NOTIFICATION_TO: settings.NOTIFICATION_TO, NOTIFICATION_FROM: settings.NOTIFICATION_FROM };
    if (target.pathname === '/api/maintenance') {
      await retention.scheduled({}, { DB: env.DB! });
      try { await deliverNotifications(env.DB!, env); } catch { /* Pending notifications remain queued. */ }
      return secureResponse(Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } }));
    }
    const handler = target.pathname === '/api/contact/config' ? handleConfig : target.pathname === '/api/contact' ? handleContact : handleAdmin;
    return secureResponse(await handler(normalized, env));
  } catch { return reply(503, 'The service is temporarily unavailable. Please try again.'); }
  finally { connection?.client.close(); }
}
