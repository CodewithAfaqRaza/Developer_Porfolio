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
      env.DB.prepare("DELETE FROM contact_notifications WHERE inquiry_id IN (SELECT inquiry_id FROM contact_notifications WHERE created_at < ? OR NOT EXISTS (SELECT 1 FROM contact_inquiries i WHERE i.id = contact_notifications.inquiry_id) LIMIT 500)").bind(now - CONTACT_RETENTION_DAYS * 86400000),
    ]);
  },
  async fetch(): Promise<Response> { return new Response(null, { status: 404 }); },
};
