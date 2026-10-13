# Private submissions dashboard

Open `/admin` to view enquiries in a private, responsive inbox. You can search loaded enquiries, view every submitted field, load older pages, refresh, and log out. There is no registration or public access to submissions. The portfolio has no link to the private workspace.

## First local login

In your project terminal:

```sh
export PATH="/tmp/node-v22.23.3-darwin-arm64/bin:$PATH"
npm run admin:setup
npm run dev
```

If the development server is already running, keep it running; no second `dev` command is needed. Open **http://127.0.0.1:5173/admin**, paste the password printed by the setup command, tick the local verification checkbox, and log in. No username is required. New submissions from the local contact form appear here after Refresh. Local and production databases are separate.

Save the generated password in a password manager. Only its hash is saved in the private `.local/admin-secrets.json`. Running `npm run admin:setup` again replaces your local password and invalidates existing sessions. It does not delete enquiries or change their encryption key. The PATH line uses the temporary Node installation available on this machine; a normal Node 22.12+ installation removes the need for that line.

## Production login

For Vercel, follow [VERCEL_SETUP.md](VERCEL_SETUP.md), using Turso and Vercel environment variables. The following steps describe the alternative Cloudflare deployment.

Complete [CONTACT_SETUP.md](CONTACT_SETUP.md) first: D1 binding, encryption key, canonical HTTPS origin, real Turnstile keys, deployment. Apply the new migration:

```sh
npx wrangler d1 migrations apply portfolio-contact --remote
npm run admin:setup -- --production
```

Save the new **production** password printed by that command. Its hash is written to private `.env.admin`. Upload it to your actual Pages project:

```sh
npx wrangler pages secret bulk .env.admin --project-name YOUR_PROJECT
npm run build
npx wrangler pages deploy dist --project-name YOUR_PROJECT --branch main
npx wrangler deploy --config maintenance/wrangler.jsonc
```

Open `https://YOUR_PROJECT.pages.dev/admin` (or your canonical custom domain), enter your production password, complete the real CAPTCHA, and log in. Use the same Turnstile widget as the public form; the admin action is `admin-login`, validated server-side. No new paid service is required by this implementation. Live account deployment and CAPTCHA must still be tested by the owner.

To rotate the production password, repeat production setup, upload the hash, and redeploy. Never replace `DATA_ENCRYPTION_KEY` to reset a login: it decrypts existing submissions. Password rotation and encryption keys are independent.

## Security and limits

- The setup command generates 32 cryptographically random bytes, encoded as a 43-character password. SHA-256 stores a verifier for this high-entropy secret. Do not replace it with the hash of a human-chosen password; this scheme relies on the generated secret's entropy.
- Sessions last one hour and use opaque random tokens in HttpOnly, SameSite=Strict cookies. Production cookies additionally use Secure and the `__Host-` prefix. Only token hashes are stored in D1. Logout revokes the session; password rotation invalidates all sessions.
- Login requires same-origin POST requests, bounded input, and persistent rate limits (5 attempts per client per 15-minute window; 50 globally per hour). Production additionally requires real CAPTCHA for the correct action and hostname. Local verification is simulated and restricted to the loopback adapter.
- Every read checks the session. Replies are no-store; decrypted data is never saved in browser storage. Inquiry text is rendered as text, never injected as HTML. Session checks clear the inbox after expiry or revoked access; use Log out when finished.
- Pages contain 25 records, newest first; Load older submissions retrieves another page. Search covers loaded records only. Records older than 180 days are excluded and removed by existing maintenance. The maintenance Worker also removes expired sessions.
- This dashboard is read-only. Deletion remains an owner terminal/D1 action documented in the contact guide. There is no email notification or password recovery email; rotate credentials from your trusted project terminal/Cloudflare account.
