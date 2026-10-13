# GitHub and Vercel deployment

The private repository is https://github.com/Danikhan88/danyal-zeb-portfolio. The public portfolio is https://danyal-zeb-portfolio.vercel.app and the owner dashboard is https://danyal-zeb-portfolio.vercel.app/admin. GitHub is connected to Vercel for deployments from `main`.

Production uses Vercel Hobby, the $0/month Turso Starter integration (`portfolio-contact`), and a Managed Turnstile widget restricted to the live hostname. Both schema migrations and production environment settings are configured. The generated production password is saved privately in `.local/production-admin-password.txt`; local credentials remain separate. Do not rerun secret generation to obtain the existing password. Secrets and local submissions are excluded from Git and uploads.

## Files to commit and ignore

Commit source, `api/`, `server/`, `shared/`, schema migrations, tests, public assets (résumé/screenshots/video), scripts, documentation, `package.json`, `package-lock.json`, `vercel.json`, and credential-free examples. The Cloudflare alternative in `functions/` is also retained.

`.gitignore` excludes dependencies, build output, local submissions/databases/session tokens, real environment files, `.dev.vars` variants, exports, Vercel/Cloudflare local state, test results, coverage, logs, temporary output, private keys, editor files and local account/configuration directories. `.env.example` and `.dev.vars.example` deliberately contain only placeholders. `.vercelignore` also keeps private files out of CLI uploads.

## Free-plan requirements

[Vercel Hobby](https://vercel.com/docs/plans/hobby) is free but restricted to personal, non-commercial use. Since this portfolio collects enquiries for paid work, check eligibility with Vercel before choosing Hobby. Do not start paid trials or upgrades automatically. [Turso Free](https://turso.tech/pricing) and [Turnstile Free](https://developers.cloudflare.com/turnstile/plans/) are subject to usage limits; leave paid overages disabled. Cloudflare Pages remains a supported alternative.

## Production setup

1. Authenticate GitHub as **Danikhan88**, create the private repository and push it. Never paste access tokens into chat.
2. Sign into Vercel and import the repository under your personal account. Framework **Vite**, build `npm run build`, output `dist`, Node **22.x**. Preserve `vercel.json` routing. Obtain the actual canonical `https://…vercel.app` origin. An initial deployment can display the portfolio before secrets are configured, but form/admin access fail closed until setup is complete.
3. Create a database on Turso's **Free** plan and obtain its `libsql://….turso.io` URL and database token. Create a Managed Turnstile widget restricted to your actual hostname. The same widget supports the `contact` and `admin-login` actions.
4. Generate application secrets in your trusted project terminal:

```sh
npm run admin:setup -- --production
npm run secrets:vercel -- https://YOUR_ACTUAL_PROJECT.vercel.app
```

Save the printed production password in a password manager. Open private `.env.production.local` and replace the Turso URL/token and Turnstile placeholders. Back up the encryption key securely. The helper refuses to overwrite an existing environment file. Local SQLite data and local passwords are separate from production.

5. Apply the schema to the configured remote database:

```sh
npm run db:migrate
```

This explicitly writes the two idempotent schema migrations using atomic batches. It does not upload local visitor data or replace encryption keys.

6. Add these variables in Vercel Settings → Environment Variables, scoped to **Production**, then redeploy:

| Variable | Purpose |
| --- | --- |
| `SITE_ORIGIN` | Exact canonical HTTPS origin without trailing slash |
| `TURSO_DATABASE_URL` | Hosted database URL |
| `TURSO_AUTH_TOKEN` | Private database token |
| `TURNSTILE_SITE_KEY` | Public widget key, returned by the API |
| `TURNSTILE_SECRET_KEY` | Private CAPTCHA verifier |
| `DATA_ENCRYPTION_KEY` | Generated base64-encoded 32-byte AES-GCM key |
| `RATE_LIMIT_SECRET` | IP hashing salt |
| `ADMIN_PASSWORD_HASH` | Generated production credential verifier |
| `CRON_SECRET` | Generated secret for maintenance |

Copy values privately from your generated file; never commit them or put them in `VITE_` variables. Vercel supplies the `VERCEL` runtime flag. Preview domains intentionally cannot use production-origin APIs. Redirect other production domains to the canonical origin.

7. Check `/api/contact/config` reports `local: false` and `hosting: vercel`. Complete real CAPTCHA and submit a synthetic enquiry. Log into `/admin` with your production password, inspect all fields and log out. Verify security headers, anonymous read denial and scheduled cleanup. Remove synthetic online enquiries through trusted database tooling afterward.

## Runtime and maintenance

`api/index.ts` routes to the existing validation, encryption, session and CAPTCHA handlers. The libSQL adapter preserves atomic transactions. Vercel's `x-vercel-forwarded-for` is validated; incoming Cloudflare IP headers are discarded. Production never uses local SQLite or simulated CAPTCHA.

`vercel.json` serves `/admin`, routes API calls, applies static security headers and schedules authenticated `/api/maintenance` daily. [Hobby cron jobs are limited to daily execution](https://vercel.com/docs/cron-jobs/usage-and-pricing). Cleanup uses bounded batches, so a large backlog may need further runs. Expired enquiries are excluded from dashboard reads after 180 days while deletion is pending. Missing secrets, database failures or exhausted free quotas make services unavailable rather than bypass verification.

After changing security headers, regenerate configuration with `npm run vercel:config`. Cloudflare deployment is documented in CONTACT_SETUP.md. Rotate passwords independently from `DATA_ENCRYPTION_KEY`; changing the encryption key makes existing records unreadable.

## Before pushing

```sh
npm run build
npm run test:api
npm test
git status --short
git diff --cached --stat
```

Ensure `.local/`, `.env.production.local`, `.env.admin`, `.dev.vars`, `.vercel/`, database files and exports are not tracked. Commit `package-lock.json` for reproducible installs. The small original video source is intentionally versioned for optional rendering; runtime images/video/PDF remain in `public/`.
