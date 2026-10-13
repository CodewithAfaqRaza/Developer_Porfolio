import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const origin = process.argv[2];
if (!origin) throw new Error('Provide your actual public HTTPS origin.');
const url = new URL(origin);
if (url.origin !== origin || url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Use an exact public HTTPS origin without a trailing slash or path.');
const admin = existsSync('.env.admin') ? readFileSync('.env.admin', 'utf8').match(/^ADMIN_PASSWORD_HASH=([a-f0-9]{64})$/m)?.[1] : null;
if (!admin) throw new Error('First run npm run admin:setup -- --production and save your owner password.');
writeFileSync('.env.production.local', [
  `SITE_ORIGIN=${origin}`,
  'TURSO_DATABASE_URL=libsql://YOUR_DATABASE-YOUR_ACCOUNT.turso.io',
  'TURSO_AUTH_TOKEN=REPLACE_WITH_DATABASE_TOKEN',
  'TURNSTILE_SITE_KEY=REPLACE_WITH_REAL_PUBLIC_WIDGET_KEY',
  'TURNSTILE_SECRET_KEY=REPLACE_WITH_REAL_PRIVATE_WIDGET_KEY',
  `DATA_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`,
  `RATE_LIMIT_SECRET=${randomBytes(32).toString('hex')}`,
  `ADMIN_PASSWORD_HASH=${admin}`,
  `CRON_SECRET=${randomBytes(32).toString('hex')}`,
  '',
].join('\n'), { mode: 0o600, flag: 'wx' });
console.log('Created private .env.production.local. Add real database and Turnstile values in your editor, and back up the encryption key.');
