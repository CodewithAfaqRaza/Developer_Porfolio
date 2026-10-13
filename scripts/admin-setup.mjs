import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
const production = process.argv.includes('--production');
const password = randomBytes(32).toString('base64url');
const hash = createHash('sha256').update(password).digest('hex');
const path = production ? '.env.admin' : '.local/admin-secrets.json';
if (!production) { mkdirSync('.local', { recursive: true, mode: 0o700 }); chmodSync('.local', 0o700); }
writeFileSync(path, production ? `ADMIN_PASSWORD_HASH=${hash}\n` : JSON.stringify({ ADMIN_PASSWORD_HASH: hash }), { mode: 0o600 });
chmodSync(path, 0o600);
console.log(`New ${production ? 'production' : 'local'} owner password (save in your password manager):\n${password}\n\nStored only its hash in ${path}. ${production ? 'Upload ADMIN_PASSWORD_HASH as a production environment secret; this password does not affect local login.' : 'Open http://127.0.0.1:5173/admin to log in. Existing sessions are revoked.'}`);
