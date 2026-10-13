import type { ContactDatabase } from './contact.ts';

export interface NotificationEnv {
  RESEND_API_KEY?: string;
  NOTIFICATION_TO?: string;
  NOTIFICATION_FROM?: string;
  SITE_ORIGIN?: string;
  LOCAL_DEVELOPMENT?: boolean;
}
const DAY = 86400000;
const MAX_ATTEMPTS = 8;
type Pending = { inquiry_id: string; created_at: number; attempts: number };

/** The recipient and sender come only from private server settings, never form input. */
export function notificationAddressConfigured(env: NotificationEnv): boolean {
  const email = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return env.LOCAL_DEVELOPMENT !== true && Boolean(env.NOTIFICATION_TO && env.NOTIFICATION_FROM
    && env.NOTIFICATION_TO.length <= 254 && env.NOTIFICATION_FROM.length <= 254
    && email.test(env.NOTIFICATION_TO) && email.test(env.NOTIFICATION_FROM));
}

/** Await delivery while the serverless invocation is alive. Failed sends stay queued. */
export async function deliverNotifications(database: ContactDatabase, env: NotificationEnv, inquiryId?: string): Promise<void> {
  if (!notificationAddressConfigured(env) || !/^re_[A-Za-z0-9_-]{16,}$/.test(env.RESEND_API_KEY || '')) return;
  const origin = new URL(env.SITE_ORIGIN || '');
  if (origin.protocol !== 'https:' || origin.origin !== env.SITE_ORIGIN) return;
  const now = Date.now();
  const result = await database.prepare(`SELECT n.inquiry_id, n.created_at, n.attempts FROM contact_notifications n
    JOIN contact_inquiries i ON i.id = n.inquiry_id
    WHERE n.sent_at IS NULL AND n.next_attempt_at <= ? AND n.attempts < ? AND n.created_at > ?
    ${inquiryId ? 'AND n.inquiry_id = ?' : ''} ORDER BY n.created_at LIMIT 3`)
    .bind(now, MAX_ATTEMPTS, now - 7 * DAY, ...(inquiryId ? [inquiryId] : [])).run();
  for (const row of (result.results || []) as Pending[]) {
    // Compare-and-set lease prevents concurrent requests/cron jobs sending together.
    const claim = await database.prepare(`UPDATE contact_notifications SET attempts = attempts + 1, next_attempt_at = ?
      WHERE inquiry_id = ? AND sent_at IS NULL AND next_attempt_at <= ? AND attempts = ?`)
      .bind(now + 5 * 60000, row.inquiry_id, now, row.attempts).run();
    if (claim.meta?.changes !== 1) continue;
    let error = 'network';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(5000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json',
          'Idempotency-Key': `portfolio-inquiry/${row.inquiry_id}` },
        body: JSON.stringify({ from: env.NOTIFICATION_FROM, to: [env.NOTIFICATION_TO],
          subject: 'New portfolio inquiry',
          text: `A new project or collaboration inquiry has been saved.\n\nReference: ${row.inquiry_id}\nSubmitted: ${new Date(row.created_at).toISOString()}\n\nReview it securely: ${origin.origin}/admin\n\nVisitor contact details are available only after you log in to the dashboard.`,
        }),
      });
      if (response.ok) {
        const body = await response.json() as { id?: unknown };
        if (typeof body.id === 'string' && body.id.length > 0) {
          await database.prepare('UPDATE contact_notifications SET sent_at = ?, last_error = NULL WHERE inquiry_id = ?')
            .bind(Date.now(), row.inquiry_id).run();
          continue;
        }
        error = 'invalid-response';
      } else { error = `provider-${response.status}`; }
    } catch { /* Never log response bodies, credentials or recipients. */ }
    await database.prepare('UPDATE contact_notifications SET next_attempt_at = ?, last_error = ? WHERE inquiry_id = ? AND sent_at IS NULL')
      .bind(now + Math.min(DAY, 15 * 60000 * 2 ** row.attempts), error, row.inquiry_id).run();
  }
}
