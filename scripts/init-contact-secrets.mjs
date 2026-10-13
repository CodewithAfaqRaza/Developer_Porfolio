import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const origin = process.argv[2];
if (!origin) throw new Error('Provide your final HTTPS site origin.');
const url = new URL(origin);
if (url.origin !== origin || url.protocol !== 'https:' || ['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw new Error('Use an exact public HTTPS origin, without a trailing slash or path.');
writeFileSync('.dev.vars', [
  `SITE_ORIGIN=${origin}`,
  'TURNSTILE_SITE_KEY=REPLACE_WITH_REAL_PUBLIC_WIDGET_KEY',
  'TURNSTILE_SECRET_KEY=REPLACE_WITH_REAL_PRIVATE_WIDGET_KEY',
  `DATA_ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`,
  `RATE_LIMIT_SECRET=${randomBytes(32).toString('hex')}`,
  '',
].join('\n'), { mode:0o600,flag:'wx' });
console.log('Created private .dev.vars. Add the real Turnstile keys in your editor; keep a secure backup.');
