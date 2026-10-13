# Reference-inspired light portfolio — validation

## Live Vercel verification — 13 October 2026

Published https://danyal-zeb-portfolio.vercel.app from the private `Danikhan88/danyal-zeb-portfolio` repository. Vercel Hobby and the $0/month Turso Starter integration are configured, schema migrations applied, production secrets uploaded, and Managed Turnstile restricted to the canonical hostname. No local visitor records were uploaded.

The deployed TypeScript API needed `rewriteRelativeImportExtensions` so emitted JavaScript imports resolve. Verified the emitted API loads, then confirmed the production build succeeds. Live pages and `/admin` return 200 with security headers. Contact configuration reports real CAPTCHA, `local: false`, and Vercel hosting. Anonymous inquiry reads return 401; unknown routes return 404; unauthenticated maintenance returns 401; authenticated maintenance succeeds against Turso; cross-origin submissions return 403; local CAPTCHA bypass tokens return 400.

Installed Chrome loaded all 12 projects with no page errors and displayed the owner password field and real Cloudflare checkbox. Turnstile required human interaction and did not issue an automated token. A successful live contact submission, CAPTCHA-verified admin login and inbox read still require a manual browser check; they are not claimed as verified. Existing local API and browser test results are recorded below. Production password is stored in the ignored `.local/production-admin-password.txt`; it is never committed.

Validated on 13 October 2026 (Asia/Karachi). This supersedes previous design validation. The latest user preference is mostly light, closest to https://wqsoftwares.com/.

## Completed

- Read the reference through web retrieval and inspected desktop Chrome screenshots at the hero, introduction, expertise grid, and lower-page content.
- Rebuilt the composition with an abstract 3D technology animation with a matching static poster, illustrated introduction, approach section, six expandable capability cards, and 12 real Drupal projects.
- Strict TypeScript and Vite production build passed.
- All ten Chrome browser tests passed.
- Horizontal overflow checked at 360, 390, 768, 1024, and 1440px.
- Keyboard skip link, mobile navigation, anchors, dialog Escape dismissal and focus restoration passed.
- Native-scroll hero/gallery transforms and reduced-motion cleanup passed.
- Touch navigation and project access passed.
- Original hero image loaded successfully; capability stack details expanded/collapsed with correct ARIA state.
- Desktop/mobile screenshots and all five scenes of the playing animated hero were visually inspected.
- Verified the video is exactly 30 seconds, five sampled scenes decode to distinct frames, and playback wraps from the end back to the beginning.
- Verified supporting paragraphs are at least 13px on desktop and mobile. Labels, navigation, tags, links, and footer text were enlarged; decorative text inside interface illustrations remains scaled to the artwork.
- Verified actual muted inline video playback, looping configuration, absence of visible playback controls, offscreen suspension/resumption, no video request under reduced motion, and image fallback after a failed video request.

- All 12 project cards and live links were verified; each detail dialog shows the correct integration scope, with Tahaluf and American Elements excluded. Screenshot assets loaded successfully.

- All 12 corner phone previews were verified; five are live captures and seven visibly labeled concepts. Hover motion, reduced-motion suppression, project dialog access, and narrow-screen overflow were checked.

## Assets and scope

The current hero uses a locally bundled 30-second video (about 1.6 MB), combining commercially usable Mixkit 3D device footage with four original Canvas2D animation scenes: network connections, modular architecture, interface panels, and a connected globe. Soft crossfades connect the scenes; the ending returns to the matching static poster for the loop. The poster (about 43 kB) and video are styled as a light monochrome background. Source, license, and checksum are in ASSET_NOTES.md. The original generated workspace photo is retained as a historical asset; it is no longer the active hero poster. The live-action developer clip was removed. No visible playback button or native controls are rendered, per the user's request. Muted inline autoplay, offscreen/tab suspension, reduced-motion/data-saving download avoidance, and static fallback remain active.

The gallery now contains 12 real project entries, four monochrome public-site captures and eight cleaned user-supplied screenshot edits; all 12 projects have screenshot previews. Animation observations and retrieval limits are recorded in `research/PROJECT_REVIEW.md`; backend contributions use Danyal's confirmation.

The engineering illustrations are original SVG with unique gradient IDs. Scroll movement uses GSAP with cleanup and native scroll; reduced motion provides the complete static layout. A resize observer refreshes animation geometry when capability details expand.

## Limits and launch work

No fresh Lighthouse score, Safari walkthrough, real-device FPS, screen-reader audit, or real-user Core Web Vitals measurement was performed for this iteration; previous scores belong to earlier designs. Career history, real email, GitHub, and CV remain awaiting content. The 12 real Drupal projects and ten-project integration scope were supplied and confirmed by Danyal; portfolio cards use development-contributor attribution. The draft remains blocked from search indexing. No remote repository or public deployment was created. README contains local commands and deployment steps.

## Link hover refinement

Added animated underlines and arrow movement to navigation, project, hero, contact, and footer links, with keyboard-focus equivalents. Brand and footer wordmark accents also respond to hover. Fine-pointer hover avoids persistent touch states; reduced motion keeps arrows stationary and underlines immediate. Production build and the responsive navigation/focus browser check passed. A separate Chrome interaction check verified underline completion without changing link width, keyboard focus, and reduced-motion arrow/transition suppression across navigation, project, contact, and footer links.

## Contact form and security implementation

Validated on 13 October 2026. Added all requested fields, optional phone, explicit consent/privacy details, country/budget choices, server-side validation, real encrypted persistent SQLite storage locally, and D1/Turnstile production handlers. The local verification checkbox is a labeled simulation restricted to loopback; production rejects it and dummy Turnstile keys.

Strict TypeScript/Vite build and Cloudflare Pages Functions compilation passed. All 16 API security tests and 14 browser tests passed. Browser coverage includes an actual encrypted insertion/receipt with test-row cleanup, field errors/mobile layout, duplicate prevention, failed-save field preservation, production widget expiry without bypass, and secret/database download denial. Native SQLite security tests exercise SQL, crypto tampering, validation, origin/method/body limits, timeouts, transactional IP/global limits, storage failures, and retention. Known-vulnerability audit returned zero findings, including the added Wrangler tooling.

A private hourly retention Worker is supplied. Live Cloudflare deployment, real Turnstile validation, D1 bindings, scheduled cleanup and headers must be verified after the owner configures the free account. No notification email service, public admin panel, professional penetration test, or guarantee against all attacks is claimed. Setup and controls are documented in CONTACT_SETUP.md and SECURITY.md.

The Cloudflare retention Worker dry-run compiled successfully. A local Pages runtime confirmed static CSP/nosniff/anti-framing headers, no-store on API responses, 503 for absent production secrets and 404 for unknown API routes. Actual dev-server requests to private key/database/filesystem paths returned 403. The owner inquiry reader ran successfully with the empty database after synthetic test-row cleanup.

## Private submissions dashboard

Added `/admin` with generated owner-password login, server-side sessions, a responsive inbox, submission details, search across loaded records, cursor pagination, refresh and logout. No browser storage holds submissions or credentials. The password setup script stores only a verifier for a cryptographically random 256-bit password. Its local and production modes were verified in an isolated temporary directory without changing owner credentials.

Strict TypeScript/Vite build, 25 API tests, and all 16 browser tests passed. The two admin browser checks were repeated after settling the mobile screenshot viewport. Admin API coverage exercises encrypted contact-to-inbox reads, unauthenticated denial, logout revocation, expiry, password rotation, cross-origin rejection, production CAPTCHA action/hostname checks, persistent login limits, no-store headers, pagination with tied timestamps, and expired-data exclusion. Scheduled cleanup also covers expired sessions. Desktop and mobile screenshots were inspected. Browser UI scenarios use mocked admin API responses; handler/database security tests use real in-memory SQLite and Web Crypto.

Pages Functions compilation and the updated maintenance Worker dry-run passed. No Cloudflare resources were deployed or live credentials configured. Real hosted CAPTCHA, production secrets, migrations, and D1 session behavior still require live-account verification. First local login requires `npm run admin:setup`; see ADMIN_SETUP.md.

## Searchable countries and shared content

Native form dropdowns now use an inset chevron with 50px text padding and an 18px right inset. Country selection uses an accessible searchable combobox with name/code filtering, accent normalization, mouse/touch selection, arrow keys, Enter, Escape, outside-focus dismissal and empty-result feedback. The submitted value remains a validated ISO country code. Clicking an already-selected field reopens the list.

Country codes, budget options/currency and retention policy now share `shared/contact.ts` across UI, API, dashboard and cleanup. Profile names, initials, branding, consent copy, admin title and HTML/share metadata derive from profile data. Existing project counts and copyright year were already dynamic. Static marketing copy, visual assets and project descriptions remain intentional authored content; no career history or contact details were invented.

Final production build, all 25 API tests and all 17 browser tests passed. New browser coverage checks country name/code filtering, keyboard and pointer choices, repeated opening, no-result validation, mobile/desktop overflow and dropdown spacing. Desktop/mobile form snapshots were inspected. Pages Functions compilation and maintenance dry-run passed after the shared-rule extraction. Built HTML was checked for resolved profile metadata without template tokens.

## GitHub preparation and Vercel support

Expanded Git and deployment ignores to cover local submissions/database/session credentials, production environment files, Cloudflare/Vercel state, private keys, exports, logs, test results and editor/cache output. Credential-free examples, lockfile, public runtime assets and schema/source remain versioned. A new Git repository uses `main`; remote creation/push requires authenticated account access.

Added a native Vercel API entry, transactional Turso/libSQL database adapter, trusted-platform IP handling, security headers, `/admin` routing and secret-protected daily maintenance. Production config advertises the actual hosting provider for the privacy notice. Local SQLite behavior is unchanged. New tests exercise the actual libSQL client's atomic rollback, parameter binding, ciphertext persistence, origin/auth/IP rejection, login/logout and cron authorization.

Production build, 31 API tests and all 17 browser tests passed. The official Vercel Node builder compiled the function as `nodejs`, with 136 traced files and no private environment or local database files. Remote Turso migrations, real Turnstile, hosted cron and live production behavior remain pending account/credential setup. VERCEL_SETUP.md records required settings and the Hobby personal/non-commercial restriction.
