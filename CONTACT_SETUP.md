# Contact form: local use and free hosting

For Vercel deployment, use [VERCEL_SETUP.md](VERCEL_SETUP.md). Local development is unchanged; Cloudflare instructions below are an alternative.

The form collects name, email, optional phone, country, project/collaboration type, description, and a USD budget range. It requires consent to store the inquiry and use it to respond. No notification email service is configured; read inquiries with the owner commands below.

## Local use

Use Node 22.12+ with built-in SQLite (tested with Node 22.23.3):

```sh
npm ci
npm run dev
```

Open the printed address, normally `http://127.0.0.1:5173/#contact`. `npm run dev` starts both the frontend and the local API. Submissions persist in `.local/contact.sqlite`; the generated private keys are in `.local/contact-secrets.json`. Neither file is public or committed. Keep the database and its key together when backing up. The verification checkbox is explicitly a development simulation, accepted only by the loopback-bound Vite adapter. Production handlers always disable it.

```sh
npm run inquiries:list
npm run inquiries:delete -- INQUIRY_UUID
npm run inquiries:prune
```

`list` decrypts the newest 100 local inquiries for you. `delete` removes the specified local inquiry. `prune` removes expired local inquiries and old rate-limit records. To view enquiries in the browser, set up the private `/admin` dashboard using [ADMIN_SETUP.md](ADMIN_SETUP.md). Browser test inquiries are removed after verification.

`npm run preview` previews static assets only; it does not serve the contact API. Use `npm run dev` for the working local form. Local secrets and database files are denied by Vite even through `/@fs/` URLs.

## Cloudflare free setup

Cloudflare Pages Functions use the [Workers Free limits](https://developers.cloudflare.com/workers/platform/pricing/). [D1 Free](https://developers.cloudflare.com/d1/platform/pricing/) currently includes 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage. [Turnstile has a free plan](https://developers.cloudflare.com/turnstile/plans/). Stay on Free; exceeding included limits can make the form unavailable. A `pages.dev` address avoids domain-registration cost. Cloudflare account resources and live keys have not been created by this project.

1. Create a free Cloudflare account, enable account MFA, and log in:

```sh
npx wrangler login
npx wrangler pages project create YOUR_PROJECT --production-branch main
npx wrangler d1 create portfolio-contact
```

2. Put the returned database ID in both `wrangler.jsonc` and `maintenance/wrangler.jsonc`. Replace the Pages `name` with your actual project name. Apply the schema:

```sh
npx wrangler d1 migrations apply portfolio-contact --remote
```

3. Create a Managed Turnstile widget in the Cloudflare dashboard. Restrict its allowed hostnames to your actual Pages/custom domain. Keep the **secret key** private. Do not use Turnstile's public testing keys for production; the server rejects them.

4. Generate application secrets using the final public origin, with no trailing slash:

```sh
npm run secrets:create -- https://YOUR_PROJECT.pages.dev
```

Open the private `.dev.vars` file in your editor and replace the two widget-key placeholders. The encryption key and rate-limit secret have already been generated. Store a secure backup of the encryption key; encrypted inquiries cannot be read without the same key. Upload settings without placing them on the command line:

```sh
npx wrangler pages secret bulk .dev.vars --project-name YOUR_PROJECT
```

5. Build and deploy the complete project, including `functions/`. A plain static-file drag-and-drop upload does not install this API:

```sh
npm run build
npx wrangler pages deploy dist --project-name YOUR_PROJECT --branch main
npx wrangler deploy --config maintenance/wrangler.jsonc
```

The maintenance Worker has no public route and prunes expired inquiries hourly, including during quiet periods. Deploy it alongside the form to match the displayed 180-day deletion schedule. Inquiries are also pruned during successful submissions, in bounded batches. For a Git-connected Pages project, configure the same D1 `DB` binding and secrets, build with `npm run build`, and publish `dist` while preserving the repository's `functions/` directory.

6. Verify `/api/contact/config` reports `local: false`, complete the real widget, submit an inquiry, confirm the encrypted D1 row and decrypt it with owner tooling. Check the live response headers and the scheduled Worker. A missing binding, dummy CAPTCHA key, wrong origin, or missing secret causes the form to reject submissions rather than bypass protection. Configure `SITE_ORIGIN` for one canonical origin and redirect other hostnames to it. Preview domains intentionally cannot submit to a production-origin API.

## Read online inquiries privately

From an authenticated terminal, export encrypted rows:

```sh
npx wrangler d1 execute portfolio-contact --remote --command "SELECT id, created_at, payload FROM contact_inquiries ORDER BY created_at DESC LIMIT 100;" --json > contact-export.json
```

Set `DATA_ENCRYPTION_KEY` privately in that terminal session to the same key used by the deployed API. Then:

```sh
CONTACT_EXPORT_PATH=contact-export.json npm run inquiries:list
```

The reader supports Wrangler's JSON result envelope. Keep exported data private and remove it when finished. Do not put exports in `public/`. Delete remote inquiries through the authenticated D1 dashboard using a specific submission UUID; there is no public deletion API. Verify the requester owns the contact address before granting access to or deleting somebody else's inquiry.

## Checks

```sh
npm run build
npm run test:api
npm test
npx wrangler pages functions build --outdir /tmp/portfolio-functions-build
npm audit
```

See [SECURITY.md](SECURITY.md) for implemented controls, deployment responsibilities, and practical limits. Real hosted Turnstile, D1 bindings, and cron execution need a live-account verification after deployment.
