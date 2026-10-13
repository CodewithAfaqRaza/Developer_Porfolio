-- No clear-text contact details or IP addresses are stored in either table.
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL CHECK (created_at > 0),
  payload TEXT NOT NULL CHECK (json_valid(payload))
);

CREATE INDEX IF NOT EXISTS contact_inquiries_created_at
  ON contact_inquiries(created_at);

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts >= 1 AND attempts <= 101),
  expires_at INTEGER NOT NULL CHECK (expires_at > 0)
);

CREATE INDEX IF NOT EXISTS contact_rate_limits_expires_at
  ON contact_rate_limits(expires_at);
