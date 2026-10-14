# Danyal Zeb — Thoughtful Web Engineering

A mostly light, monochrome developer portfolio inspired by the composition of [WQsoftwares](https://wqsoftwares.com/), following the user's chosen light direction. A full-width muted video hero with matching animation-frame fallback, monospaced typography, illustrated introduction and approach, expandable capability cards, and 12 real Drupal projects. The original [master plan](DANYAL_ZEB_PORTFOLIO_MASTER_PLAN.md) remains in the project; subsequent reference and palette preferences supersede its original neon/3D art direction. React + TypeScript + Vite frontend with a working contact API, encrypted local SQLite storage, Vercel/Turso deployment support, and an alternative Cloudflare Pages/D1 deployment.

## Run locally

Install a supported Node.js LTS (22.12+). Then, from this directory:

```sh
npm ci
npm run dev
```

Open the printed URL (normally http://127.0.0.1:5173). Check/build:

```sh
npm run typecheck
npm run build
npm run preview
```

Implementation used a temporary Node 22 runtime under `/tmp/node-v22.23.3-darwin-arm64`. It is not a permanent system installation and may be removed by macOS. To use it while available:

```sh
export PATH="/tmp/node-v22.23.3-darwin-arm64/bin:$PATH"
npm run dev
```

## Replace dummy content

- `src/data/profile.ts`: name, copy, approved role, capability descriptions, real email, GitHub, LinkedIn, CV URL. Email/GitHub controls stay hidden while empty. The supplied résumé is in `public/danyal-zeb-cv.pdf`; hero, header and contact links open it in a new tab, where the PDF viewer supports downloading. Replace that file to update the résumé.
- Profile names/initials, header branding, consent copy, admin title, and HTML title/share metadata derive from `src/data/profile.ts`. Country codes, budget options/currency and retention policy live in `shared/contact.ts`, used by the form, API, dashboard and cleanup jobs. Countries support name/code search, arrow keys, Enter, Escape and touch selection. Project counts and the copyright year already update automatically.
- `src/data/projects.ts`: 12 real Drupal projects supplied by Danyal, with live URLs and development-contributor attribution. Ten event projects include Swapcard, custom UTM tracking, custom URN handling, and API integration contributions, as confirmed by Danyal; Tahaluf and American Elements do not include those claims. Screenshots are in `public/images/projects/`; Every project has a screenshot preview, grayscale by default with original colors revealed on hover or keyboard focus. Touch users see color when opening project details. Research and public-motion observations are in `research/PROJECT_REVIEW.md`.
- `src/data/experience.ts`: add verified employers, role dates, and responsibilities with `verified: true`. The timeline is hidden while empty.
- `src/styles/design-tokens.css`: colors and fonts. System font stacks keep rendering independent of external font services.
- `src/index.css`: responsive layout and visual direction.

No invented email, GitHub account, employer, certification, metrics, or CV links. No marketing analytics. The contact form uses Cloudflare Turnstile for verification and includes a processing notice and consent. Draft indexing is disabled with HTML metadata and `robots.txt`.

## Reference-inspired layout and motion

`src/sections/` contains Hero, About, Approach, Skills, FeaturedWork, Experience, and Contact. The section order follows the reference's introduction → approach → capabilities → work progression, adapted for a personal portfolio. The hero uses locally bundled, a 30-second technology composition opening with licensed Mixkit device animation and adding four original rendered scenes instead of copying the reference site's company video. It autoplays muted, loops every 30 seconds inline, with no visible playback controls, as requested. Playback stops when the hero is offscreen or the tab is hidden; reduced-motion/data-saving preferences skip the video, and loading failure retains a matching static animation frame. Original SVG engineering illustrations live in `src/components/illustrations/EngineeringIllustration.tsx`.

`src/components/effects/ScrollExperience.tsx` uses GSAP ScrollTrigger for subtle video/photo parallax, headline/wordmark movement, engineering illustration rotation, capability card entrance, gallery image depth, contact movement, and a scroll progress indicator. Native scroll is preserved. Resize observation refreshes geometry when capability details expand. Reduced motion removes transforms and retains all content and controls.

Capabilities have real expandable stack details with accessible disclosure buttons. Project dialogs keep Escape dismissal and focus restoration. All career/project/contact data is in `src/data/`; missing personal links and unverified career history stay hidden.

See [ASSET_NOTES.md](ASSET_NOTES.md) for the original hero asset's saved path, built-in ImageGen provenance, and generation prompt, plus the video source and license. No company video, client logos, company claims, or copied text from the reference were added.

## Browser checks

```sh
npm test
```

Chrome checks cover horizontal overflow at 360, 390, 768, 1024, and 1440px; mobile navigation; anchors; modal keyboard focus; skip link; scroll-driven imagery; reduced-motion cleanup; touch project access; hero-image loading; capability disclosure controls; actual muted animation playback; absence of visible playback controls; offscreen suspension; reduced-motion download avoidance; and failed-video fallback. Screenshots are in ignored `test-results/`. Safari and real mobile devices remain to be checked manually.

## Contact form and hosting

A fixed WhatsApp button in the bottom-right corner opens a chat with the owner-confirmed number in `src/data/profile.ts`. It uses a locally bundled icon, a short prefilled introduction, keyboard access, safe-area spacing and reduced-motion support. It is outside scroll transforms, sits behind project dialogs, and is not shown in the private dashboard. No WhatsApp message is sent automatically.

For the requested GitHub + Vercel deployment, start with [VERCEL_SETUP.md](VERCEL_SETUP.md). It covers ignored credentials, Turso, production login/CAPTCHA and Vercel's free-plan restrictions. The contact form and `/admin` have native Vercel API support; static-only hosting does not provide persistence. Cloudflare remains an alternative.

The contact form works with `npm run dev` and persists encrypted inquiries locally. It collects name, email, country, a project/collaboration description, and budget. “Let’s discuss” is the default budget option. Phone and a separate inquiry-type selection are no longer collected. Local bot verification is explicitly simulated; deployed submissions require real Turnstile keys and server-side verification. Run `npm run admin:setup` and open `/admin` for the private submissions dashboard; see [ADMIN_SETUP.md](ADMIN_SETUP.md) for login and production setup.

```sh
npm run inquiries:list
npm run inquiries:delete -- INQUIRY_UUID
npm run inquiries:prune
npm run test:api
```

The live portfolio is https://danyal-zeb-portfolio.vercel.app and the private dashboard is at `/admin`. Production uses Vercel, Turso and real Turnstile verification. The production owner password is stored only in the ignored `.local/production-admin-password.txt`. GitHub `main` is connected to Vercel for deployments.

New saved production submissions also send an owner email notification through Resend. The email includes all submitted contact and project fields, a reference and private dashboard link. Reply-To is the visitor's submitted email address, so Gmail's Reply action targets that address. Temporary email failures do not lose submissions. Local form tests send no emails. Delivery configuration, retry limits and free-plan restrictions are in [VERCEL_SETUP.md](VERCEL_SETUP.md).

See [CONTACT_SETUP.md](CONTACT_SETUP.md) for the Cloudflare Pages/D1 alternative, secrets, migrations, hourly retention and private data access. See [SECURITY.md](SECURITY.md) for controls and limits. Cloudflare uses Functions/D1; Vercel uses its native API handler/Turso. Static-only hosting does not install either backend.

After your actual HTTPS hostname is confirmed and public content is approved, enable draft indexing with:

```sh
npm run seo -- https://YOUR-ACTUAL-PROJECT.pages.dev
npm run build
```

Use the final hostname rather than a guessed URL. `npm run preview` serves static assets only; test the working local form with `npm run dev`.

## Validation results

See [VALIDATION.md](VALIDATION.md) for measured audit results, browser coverage, output sizes, and remaining verification limits.

## Remaining launch tasks

- Replace dummy projects/positioning and approve career facts.
- Supply real email, GitHub and verified experience; the résumé and project screenshots are bundled.
- Connect GitHub/Vercel (or Cloudflare), configure production secrets/database and obtain the final URL.
- Run the SEO helper with that URL, rebuild, deploy, and verify live links.
- Check Safari, a real mobile device, and Lighthouse/Core Web Vitals before calling the site production-ready.

To replace the footage later, add your MP4 to `public/videos/` and change the `src` in `src/components/effects/HeroVideo.tsx`. Keep the video short, compressed, and licensed for your use. Supporting typography is larger throughout the site: body copy and descriptions are generally 13–16px, with larger labels, tags, and links.

The fallback image path is shared by `Hero.tsx`, `HeroVideo.tsx`, and the HTML image preload.


## Rebuild the 30-second animation (optional)

The finished 30-second video is already bundled; `npm run dev` and `npm run build` do not render video or require FFmpeg. To change the animation itself, edit `scripts/build-hero-video.mjs`. It uses the original licensed opening clip in `assets/video-source/`, then renders network, architecture, interface, and globe scenes with Canvas2D in Chrome. FFmpeg encodes a compressed H.264 MP4 with half-second crossfades and a matching loop endpoint.

With Chrome and FFmpeg installed:

```sh
FFMPEG_PATH=/absolute/path/to/ffmpeg node scripts/build-hero-video.mjs
```

Temporary scene files are written to `/tmp/danyal-hero-video`. `--assemble-only` reuses those rendered files when they exist. See ASSET_NOTES.md for the timeline and attribution. Chrome tests verify the 30-second duration, five different decoded scene frames, and the loop boundary.

## Refresh project screenshots

Run `node scripts/capture-project-previews.mjs` with Chrome installed. It captures real pages in black and white, hides cookie/privacy overlays for the capture, and records results in `research/project-captures.json`. Blocked sites retain their existing covers. All projects now have screenshot previews: four automated captures and eight user-supplied screenshot edits; see ASSET_NOTES.md. Supply URL overrides through `PROJECT_PREVIEW_URLS` as a JSON object keyed by project ID; the published live links remain the original public URLs. After successfully capturing a new project, add its `/images/projects/<id>.jpg` path to `cover` in `src/data/projects.ts`. Screenshots are bundled in normal builds; this optional script is not part of `npm run build`.

## Mobile previews and hover

Each project has `mobileCover` and `mobilePreviewKind` in `src/data/projects.ts`. Five mobile assets are live-site captures; seven are user-authorized mobile layout concepts for sites that block screenshots. All phone insets are captioned “Mobile concept” as requested by the owner, while source type and alternative text distinguish captures from illustrative concepts. Every mobile source retains color for the hover reveal. `node scripts/capture-project-mobile-previews.mjs` can refresh captures with the same URL override mechanism as desktop capture. To replace a concept with a real screenshot, update its path and set `mobilePreviewKind: "capture"`.

Cards show a small phone in the lower-right corner. Fine-pointer hover and keyboard focus animate the desktop image, phone and arrow; reduced motion keeps them static. The same paired previews appear in project dialogs. Browser validation covers loading both assets, hover movement, reduced motion, dialog access and mobile overflow.

The project gallery initially shows two projects below 768px and six on larger screens to keep desktop rows complete. “Load more projects” reveals another batch, moves focus to the first new project and announces the visible count. Expanded projects stay available when resizing; remaining image assets are not mounted until revealed. Each card owns its scroll animation so newly added cards keep the same motion and reduced-motion behavior.
