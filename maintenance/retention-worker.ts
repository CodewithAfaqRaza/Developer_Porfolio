import type { ContactDatabase } from "../server/contact";
import { CONTACT_RETENTION_DAYS } from "../shared/contact.ts";
/** Private hourly maintenance; it has no public data endpoint or decryption key. */
export default {
  async scheduled(_controller: unknown, env: { DB: ContactDatabase }): Promise<void> {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare("DELETE FROM contact_inquiries WHERE id IN (SELECT id FROM contact_inquiries WHERE created_at < ? ORDER BY created_at LIMIT 500)").bind(now - CONTACT_RETENTION_DAYS * 86400000),
      env.DB.prepare("DELETE FROM contact_rate_limits WHERE key IN (SELECT key FROM contact_rate_limits WHERE expires_at < ? ORDER BY expires_at LIMIT 500)").bind(now - 86400000),
      env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash IN (SELECT token_hash FROM admin_sessions WHERE expires_at <= ? ORDER BY expires_at LIMIT 500)").bind(now),
    ]);
  },
  async fetch(): Promise<Response> { return new Response(null, { status: 404 }); },
};
