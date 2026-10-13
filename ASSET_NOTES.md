# Original workspace hero artwork

**Tool:** built-in ImageGen.

**Saved project asset:** `public/images/workspace-hero.jpg` (1672 × 941; approximately 267 kB). The generated original was preserved in the default generated-images library; a JPEG encoding is bundled with the site.

**Usage:** original illustrative grayscale developer workspace, retained as a previous-design asset. The current hero uses the animation and poster documented below. This is original generated artwork, not a photograph of Danyal's actual office or a claimed employer/workplace.

**Final generation prompt:**

> Use case: photorealistic-natural. Asset type: full-width website hero background for a software developer portfolio. Create an original cinematic black-and-white editorial photograph of a quiet contemporary software engineering workspace, no people. Wide landscape composition approximately 16:9: a large monitor showing softly out-of-focus abstract code and a laptop sit on a minimal desk on the right half, window frames and pale concrete architecture behind, a few understated desk objects, realistic materials and depth. Left half is mostly a softly lit uncluttered wall and desk surface with gentle grayscale texture, deliberately low contrast so black HTML headline text can be overlaid there. Bright diffuse daylight, elegant mature professional mood, documentary photography rather than futuristic CGI. Grayscale only, no colored LEDs, no neon, no branding, no readable words, no watermarks. No web UI, no text overlay, no human faces.

The reference site's video, images, copy, company branding, and client logos were not copied into this project. Other illustrations are original project-native SVG, and UI icons use the existing Lucide package.

## Current animated hero background

- Video file: `public/videos/abstract-technology-30s.mp4` (30.00 seconds, approximately 1.6 MB; silent H.264, 1280×720 at 24 fps, fast-start MP4).
- Matching static poster: `public/images/abstract-tech-poster.jpg` (approximately 43 kB).
- Opening-scene source: [Animation of futuristic devices — Mixkit](https://mixkit.co/free-stock-video/animation-of-futuristic-devices-99786/).
- License: [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree). The item explicitly permits personal and commercial use; verified 13 October 2026.
- Downloaded rendition: `https://assets.mixkit.co/videos/99786/99786-720.mp4`.
- Original-source SHA-256: `ffe84cdc3fc1cbb6cdd39c6f3bcd9b69b0f1026bb8bd4e39429e2511406115f0`.
- Final-video SHA-256: `7f65c695ed6b56e467fa4dcc809581e6c7901bec684a0c334a3e83d511f6c2a7`.
- Treatment: grayscale/inverted monochrome, cover crop, readable light overlay, muted inline autoplay, looping, and scroll parallax.
- This is a computer-generated technology animation, not live-action office footage. No visible playback controls are rendered, per the user's request.

The matching poster remains visible during loading or playback failure. Video is skipped for reduced-motion and data-saving preferences, and pauses automatically offscreen or while the tab is hidden.


## 30-second composition

The approved opening device animation plays at its original speed for five seconds. Four original code-rendered scenes add network connections, modular architecture, interface panels, and a rotating connected globe. The added scenes run with 2.5× faster animation timing than the previous version. Four half-second crossfades combine 32 seconds of source scenes into a 30-second timeline. The final half-second fades back to the opening poster for a gentle loop boundary.

| Timeline | Scene |
| --- | --- |
| 0–5s | Existing device animation, original speed |
| 4.5–11.5s | Connected nodes and traveling data pulses |
| 11–18s | Isometric modular architecture |
| 17.5–24.5s | Floating interface panels and live charts |
| 24–30s | Connected globe; final half-second returns to opening poster |

Transitions overlap the scene ranges above. The four added scenes are original Canvas2D animations rendered by `scripts/build-hero-video.mjs`; they do not use additional third-party footage. The licensed original source is retained in `assets/video-source/abstract-technology.mp4` for reproducibility. Ordinary application builds use the finished MP4 and do not need FFmpeg.

## Real project previews

Four screenshots in `public/images/projects/` show the public homepages of [Umrah & Ziyarah Forum](https://umrah-ziyarah.com/), [BIO Middle East](https://biomiddleeast.com/), [Red Sea Yacht Show](https://redseayachtshow.com/), and [Kingdom of Gaming](https://kingdomofgaming.com/), captured on 13 October 2026. Updated captures are 1440 × 960 and monochrome. `scripts/capture-project-previews.mjs` hides common consent/privacy containers locally, then frames the page above bottom-anchored widgets using a taller browser viewport. Grayscale is applied before the browser screenshot, with CSS also enforcing monochrome in the gallery and dialogs. No consent form was submitted. These illustrate projects Danyal supplied for his portfolio, with live-site links and contributor attribution. Site brands and original visuals belong to their respective owners. Eight cards use cleaned user-supplied screenshots; all 12 project cards now have screenshot previews. No third-party video was downloaded for the project gallery.

Seven public sites remain blocked to automated capture. Danyal has since supplied screenshots for LEAP, Black Hat MEA, Tahaluf, the Global Water Sustainability Conference, and American Elements. Danyal has now also supplied DeepFest and Cityscape Global screenshots, plus LEAP East as a twelfth project. Capture status is in `research/project-captures.json`; unsuccessful requests never overwrite existing artwork with a security challenge screenshot.

## Supplied screenshot edits

Danyal supplied eight original screenshots on 13 October 2026. Built-in ImageGen was used to convert them to monochrome and remove browser chrome, promotional popups, floating privacy/accessibility widgets and reCAPTCHA UI. The results are presentation edits of the supplied screenshots, not fresh live-site captures; areas covered by popups are reconstructed. Site names, logos, primary text and layouts were visually checked against the attachments. Compressed JPEG versions are bundled as `public/images/projects/<id>-edited.jpg`; generated PNG originals remain in the default generated-images library. Source/output mapping is recorded in `research/supplied-screenshot-edits.json`. Project cards and dialogs fit the complete screenshot inside their frame to keep logos and headlines visible.

## Mobile corner previews

All 12 desktop previews include a phone inset in the gallery and project dialog. Five are real monochrome mobile captures: LEAP East, Umrah & Ziyarah Forum, BIO Middle East, Red Sea Yacht Show, and Kingdom of Gaming. They were captured at a 390px browser width on 13 October 2026, with consent widgets excluded. The optional capture script is `scripts/capture-project-mobile-previews.mjs`; results are in `research/project-mobile-captures.json`.

The seven sites that blocked capture use ImageGen mobile layout concepts adapted from the supplied desktop screenshots, as explicitly requested by Danyal. These are labeled **Mobile concept**, have descriptive alternative text, and are recorded in `research/project-mobile-concepts.json`. They are illustrative responsive compositions, not evidence of the deployed mobile layout. Original generated PNGs remain in the default generated-images library; small JPEG versions are bundled in the project.

Hover motion uses CSS on the inner desktop image and phone device, independently of GSAP's outer scroll movement. Desktop imagery gently scales, the phone rises and straightens, and the arrow shifts. Fine-pointer hover and keyboard focus support the effect; reduced-motion preferences disable the movement. Touch users retain the complete static preview and project interaction.
