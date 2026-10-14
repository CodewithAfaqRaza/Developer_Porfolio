# Reference-inspired light portfolio — validation

## Progressive project gallery — 14 October 2026

Mobile starts with two projects and reveals two per click; desktop starts with five and reveals five per click (5 → 10 → 12), following the owner’s updated preference. The visible/total count is announced, focus moves to the first newly revealed card and the control disappears when all projects are shown. Already expanded cards are retained on resize. Hidden project images are not mounted until their batch is revealed. Card scroll animation setup/cleanup now lives with each card, so appended cards animate correctly.

Production build and all 15 portfolio/gallery browser checks passed. Coverage includes every mobile batch, desktop expansion, preserved order/no duplicates, keyboard activation, focus and dialog restoration, count announcements, resize retention, newly mounted scroll animations, reduced-motion cleanup, all desktop/mobile source colors and hover states, responsive layouts, existing hero/navigation and project attribution. The initial mobile and desktop controls were visually inspected.

## Mobile preview color and caption correction — 14 October 2026

Seven mobile concept assets had grayscale baked into their pixels. Recolored versions now match their desktop palettes, with original layout and copy visually reviewed. All twelve phone captions read “Mobile concept” in the gallery and detail dialog as requested. Capture/concept source metadata and descriptive alternative text remain accurate.

Production build and three browser checks passed. The source pixel check now covers all 24 desktop/mobile images, plus resting grayscale, hover color and keyboard focus. Touch project details reveal both images in color and use the same caption. Existing phone inset motion, reduced-motion behavior and 390px layout remain valid.

## Project screenshot color reveal — 14 October 2026

Replaced baked-in grayscale desktop previews with original-color sources for all 12 projects. CSS preserves the monochrome resting state and reveals color on hover or keyboard focus; touch users see colors in project details. Existing motion is retained, with transitions disabled for reduced-motion preferences. Five real mobile screenshots were recaptured in color; seven concept labels remain unchanged.

Production build passed. Three browser checks passed: all 12 desktop assets contain real RGB color and switch correctly between hover/rest/focus states; touch project details reveal color; existing navigation, keyboard modal behavior, reduced-motion fallback and layout at 360, 390, 768, 1024 and 1440px remain valid. Cleaned source images and accessible-site desktop/mobile captures were visually reviewed.

## Floating WhatsApp contact — 13 October 2026

Added a fixed bottom-right WhatsApp link using the owner's confirmed `+92 316 9712793`, stored in profile data. It opens `wa.me/923169712793` with a prefilled introduction in a separate tab. No message is sent automatically. Local SVG glyph, visible keyboard focus/tooltip, desktop/mobile safe-area spacing, reduced-motion handling and footer clearance are included. It stays outside animated containers, respects native project-dialog layering and is absent from `/admin`.

Dedicated browser check passed at 390px and 1440px: correct normalized number and message, image loading, at least 44px target, viewport position across scrolling, no horizontal overflow, footer clearance, keyboard focus/activation, separate-tab navigation, dialog behavior and dashboard exclusion. Desktop/mobile screenshots were inspected. An actual read-only request followed WhatsApp's redirect and returned HTTP 200 from `api.whatsapp.com` with the expected phone query. This tests link navigation; it does not send a message or assert WhatsApp account registration.

## Simplified contact form — 13 October 2026

Removed phone and the separate project/collaboration selector. The form now collects name, email, country, description and budget, defaulting budget to “Let’s discuss.” Processing copy reflects the smaller set of fields. Missing phone/type are omitted from encrypted new records and notification emails; the dashboard uses a general inquiry label and shows phone only on records containing that legacy field. Validated older requests/records remain supported without a migration or deleting existing data.

Production build and all 37 API checks passed. The updated persisted-submission browser check verifies removed controls and absent phone/type in the decrypted saved payload. API coverage exercises simplified production saves, full details and Reply-To emails, authenticated owner reads, plus existing legacy field validation and delivery retry/security checks.

All seven contact/admin browser checks passed, covering actual encrypted saves, validation, mobile layout, searchable countries, failed-save preservation, CAPTCHA expiry, and the existing owner dashboard. The owner API read test also passed with the simplified record shape. Mobile form screenshot inspected after the controls were removed.

## Complete inquiry emails and direct replies — 13 October 2026

Updated owner notifications to include all submitted contact/project fields, readable country/budget labels, consent, timestamp, reference and dashboard link. Reply-To uses the validated submitted email, while the recipient and sender remain server settings. Email content is plain text. Sending and retries decrypt the authenticated saved inquiry; queue metadata never stores a clear-text copy. The processing notice now discloses Resend email copies and separate mailbox retention.

Production build and all 36 API tests passed. Coverage verifies full field content, direct Reply-To, optional phone, collaboration descriptions with preserved line breaks/inert markup, fixed sender/recipient, header-injection rejection, safe decryption failures, retry backoff and idempotency, atomic persistence, local suppression and private receipts. Previous validation notes below describe earlier notification formats.

All five existing contact browser checks passed. Deployed the update and verified the hosted email pipeline using one encrypted synthetic full-field inquiry and its queue entry. Authenticated maintenance returned 200 and recorded provider acceptance after one attempt with no error. Only that synthetic record and queue entry were removed afterward. The owner can inspect the received test email; its Reply-To is the clearly synthetic `reply-test@example.com`. New real notifications use each visitor's actual submitted address.

## Live Vercel verification — 13 October 2026

Owner email notifications: added an atomic database queue and server-only Resend delivery. All 34 API tests pass, including successful delivery metadata, no visitor details in emails, stable idempotency keys, concurrent lease claims, backoff after provider failures, preserved successful receipts, atomic queue rollback and local email suppression. Production notification migration and three private email settings were configured. Resend accepted a real setup email to the owner's Gmail (HTTP 200); inbox delivery is for the owner to confirm. Real CAPTCHA verification remains required for the public form.

The deployed production notification pipeline was also verified by creating one privileged encrypted synthetic test record and its delivery queue entry, calling authenticated maintenance, and confirming `sent_at` was recorded after one attempt with no provider error. The live endpoint returned 200. Only this synthetic inquiry and queue entry were removed afterward. This verifies hosted dispatch and database updates; it does not bypass or claim an automated public CAPTCHA submission.

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
