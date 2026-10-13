# Portfolio security and data handling

Reviewed 13 October 2026. The application was tested locally; production account setup and live verification remain required. No system can guarantee prevention of every bot, exploit, or denial-of-service attack. Vercel/Turso deployment is supported alongside Cloudflare/D1; see [VERCEL_SETUP.md](VERCEL_SETUP.md). The Vercel adapter discards incoming Cloudflare IP headers and trusts only the validated platform IP header. Its daily cleanup endpoint requires the generated cron bearer secret.

## Submission boundary

- Only `POST /api/contact` accepts inquiries. Reading enquiries through `/api/admin/inquiries` requires an authenticated owner session. There are no public export, attachment, or deletion endpoints. See [ADMIN_SETUP.md](ADMIN_SETUP.md) for owner login, CAPTCHA, session and password-rotation controls.
- Exact configured HTTPS origin, required `Origin` on POST, JSON-only content, and rejection of cross-site Fetch Metadata requests. There are no authentication cookies or permissive CORS rules.
- A 16 KB streamed request limit and a five-second body deadline prevent unlimited input buffering.
- The server validates types, allowed fields, ISO country codes, lengths, email/phone structure, budget options, and affirmative consent. Client validation improves usability but is not the security boundary. A honeypot catches basic spam.
- Production verifies Turnstile with Cloudflare's [Siteverify API](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), requiring the contact action, configured hostname, successful result, and a current token. The provider enforces single use. Verification has a five-second timeout and fails closed. Dummy keys and the local verification token are rejected by production.
- Transactional database limits allow five attempts per IP per 15 minutes and 100 globally per hour. They apply before input parsing/CAPTCHA and saturate rather than growing unchecked. Only Cloudflare's trusted `CF-Connecting-IP` is used online; arbitrary forwarded headers are ignored. HMAC hashes replace IP addresses in stored rate-limit records.
- SQL uses bound parameters. Responses contain generic errors or a submission UUID, with no stored user details. A receipt is returned only after the insertion transaction succeeds.

## Storage and access

Inquiries are authenticated AES-GCM encrypted before insertion, with a fresh IV and record-specific authenticated metadata. The database stores only the UUID, timestamp, and encrypted envelope. Names, email, phone, country, descriptions, and budget are not stored in clear text. Raw IPs, CAPTCHA tokens, and secrets are not stored with inquiries; the application does not log request bodies.

The encryption key must be kept separately from database exports and securely backed up. Rotation requires decrypting/re-encrypting existing records; simply replacing the key loses access to earlier records. Only the owner's authenticated Cloudflare account and private terminal tools read data. No user-supplied HTML is rendered. Export is JSON, avoiding spreadsheet formula execution from CSV cells.

Inquiry retention is 180 days. Successful submissions do bounded cleanup; the separate, private maintenance Worker performs hourly cleanup when there are no submissions. Both cap deletions per run. Deploy the cron Worker, monitor its status and quota, and manually prune if a backlog occurs. Rate-limit hashes are removed after expiry plus 24 hours. Local storage is private under `.local/`; use `inquiries:prune` for local cleanup.

## Site controls

Production responses include CSP, anti-framing, nosniff, HSTS, referrer policy, and restrictive permissions. Static headers live in `public/_headers`; function headers are applied by middleware. `_routes.json` sends only `/api/*` to Functions, keeping images/video and other static files outside the dynamic request quota.

CSP allows scripts from the site and Cloudflare's challenge origin, with no inline/eval scripts. Inline **styles** remain allowed for GSAP/React animation. Frames are restricted to Turnstile; objects and document base changes are blocked. See Cloudflare's [Turnstile CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/). Existing external links use `noopener noreferrer`. React escapes text; there is no `dangerouslySetInnerHTML` or public file-upload handling.

The development server binds to loopback. Its local API additionally checks the actual socket address, allowed hostnames, and origin. Vite denies `.local`, `.env`, `.dev.vars`, database files, exports, and workspace credential directories, including filesystem URLs. Secrets never use `VITE_` variables. Generated data, secrets, and runtime directories are ignored by Git and excluded from `dist`.

## Owner responsibilities and limits

Use the free plan, HTTPS, MFA, restricted Cloudflare accounts, restricted Turnstile hostnames, the correct D1 binding, and secrets in Pages settings. Keep dependencies current and periodically run `npm audit`. Do not commit database exports, keys, or real contact data. Account/database permissions and provider backups remain outside this source code's control.

Turnstile, origin checks, honeypots and application limits reduce abuse; determined distributed traffic can still exhaust a free quota or disrupt availability. Cloudflare edge protection is provided by the host; additional WAF/bot policies depend on the account and domain. The code does not claim a blanket compliance certification or a professional penetration test. Consent and the factual privacy notice are included, but jurisdiction-specific policy review remains an owner decision.

If the CAPTCHA provider, database, or required configuration fails, the form rejects the request. The UI preserves fields and offers retry without falsely confirming a save. Production Vercel submissions also queue owner notifications through Resend. Recipient/sender settings and credentials are server-only; visitors cannot change recipients. Email contains only the reference, timestamp and dashboard link. Email delivery failure preserves the saved inquiry and successful receipt. The authenticated maintenance route retries bounded pending batches. See VERCEL_SETUP.md for retry limits, delivery caveats and provider quotas. No local submission sends mail.
