-- Delivery metadata only. Visitor details stay in the encrypted inquiry payload.
CREATE TABLE IF NOT EXISTS contact_notifications (
  inquiry_id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL,
  sent_at INTEGER,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS contact_notifications_pending
  ON contact_notifications(sent_at, next_attempt_at);
