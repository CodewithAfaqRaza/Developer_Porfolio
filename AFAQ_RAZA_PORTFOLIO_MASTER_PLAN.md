# Danyal Zeb — 3D Portfolio: Master Plan & AI Build Brief

> **Version:** 1.0 · **Prepared:** October 2026  
> **Goal:** Build a visually LOUD, polished, exceptionally fast, 3D-driven developer portfolio and publish it publicly for **$0 recurring cost** using a free Cloudflare Pages subdomain.
>
> **Profile source:** [LinkedIn](https://www.linkedin.com/in/devdeveloper/) — LinkedIn blocked automated profile reading while preparing this document. All biographical facts, employers, dates, credentials, client work, and numerical results **must be confirmed by Danyal** before publication. Example project names below are suggestions, not verified public case studies.

---

## 0. One-minute decisions

| Decision | Choice | Why |
|---|---|---|
| Site concept | **ENGINEERED TO MOVE.** — digital experiences that move | Strong developer positioning without generic portfolio clichés |
| Style | Dark neo-brutalist/editorial + neon cybernetic details | Loud, premium, high contrast |
| Primary stack | **React + TypeScript + Vite** | Fast static output, excellent for interactive portfolios |
| 3D engine | **Three.js + React Three Fiber + Drei** | Code-controlled 3D rather than an expensive video background |
| Animation engine | **GSAP + ScrollTrigger + `@gsap/react`** | Sequenced and scroll-linked experiences |
| Smooth scrolling | **Lenis (optional)** | Smooth feel; omit if it creates accessibility or performance issues |
| Styling | **Tailwind CSS v4 + custom CSS** | Speed plus bespoke visual identity |
| Icons | Lucide React + custom SVGs | Crisp and lightweight |
| Content | Typed local TypeScript/JSON data | No CMS or database required initially |
| Repository | GitHub (recommended) | Direct Cloudflare Pages auto-deployment |
| Hosting | Cloudflare Pages **Free** | Global static CDN, HTTPS, auto deployments |
| Free address | `your-chosen-name.pages.dev` | Free platform subdomain, subject to availability |
| Contact | `mailto:` + LinkedIn/GitHub | No paid backend; optional form later |
| Budget | **$0/month** for MVP | Assumes free-tier usage and no purchased domain or paid assets |

**Important distinction:** `*.pages.dev` is a free hosted **subdomain**; it is not ownership of a free `.com`, `.dev`, or `.me` domain. Registered custom domains generally have a purchase and renewal cost. Start free; connect a purchased domain later if desired.

**Scope:** Deliver a polished one-page portfolio first; add individual case study pages only once there is strong, verified content. No Drupal backend is needed for this portfolio—keep the personal site static and showcase Drupal expertise *as content*.

---

## 1. Personal positioning and content rules

### Working positioning (edit after confirming LinkedIn/CV)

- Name: **Danyal Zeb**.
- Suggested label: **Senior Full-Stack Drupal Developer & Creative Web Engineer**.
- Suggested headline: **I BUILD DIGITAL EXPERIENCES THAT MOVE.**
- Supporting copy: **Drupal architecture. Modern frontend engineering. Unapologetically interactive web experiences.**
- Primary CTAs: **Explore Work** and **Let's Build Something**.
- Secondary CTAs: **Download CV**, **LinkedIn**, **GitHub** (only link real accounts).
- Specialties to validate: Drupal 10/11, custom modules, migrations, Twig/theming, React/Next.js, performance, accessibility, multilingual and RTL platforms, cloud deployment.
- Credentials / years: **[ADD VERIFIED EXPERIENCE YEARS AND CERTIFICATIONS]**. Do not invent employer, title, certifications, clients, testimonials, awards, traffic numbers, conversion results, or project metrics.

### Content inventory to gather BEFORE building

1. A professional photo or stylized portrait (only if you want it).
2. An approved CV PDF (`public/Afaq_Raza_Drupal_Developer.pdf`).
3. Your actual work experience, dates, and education.
4. Public GitHub and LinkedIn links.
5. A contact email you are comfortable publishing.
6. Three to five projects you are allowed to describe, with screenshots you can legally show.
7. For each project: challenge, your role, stack, engineering decisions, measurable verified outcome if available, image, and public link if available.
8. Any verified Acquia/Drupal certifications and badge links.

### Candidate case studies — publish only with permission

The following **potential examples**, based on technical work discussed, must be checked for confidentiality and attribution before publication:

| Candidate | Technical story | Evidence to gather |
|---|---|---|
| LEAP / event-platform work | Complex ticket UI, compare tool, custom Drupal paragraphs, interactive carousels | Approved screenshots, exact role, publicly shareable scope |
| Kingdom of Gaming | Drupal CMS, site architecture and component system | Approved screenshots and responsibilities |
| Bio Middle East | Lead tracking, webforms, analytics integration | Anonymized analytics description, consent to show work |
| IDWSC / conference platform | Event pages, agenda UX, multilingual or frontend work | Confirmed technical contributions |
| Headless Drupal experiment | Drupal 11 + Next.js integration concept | Publish an actual personal demo/repo if built |

**Do not** describe private company projects as solely your work. Use “I contributed to…” with scope/role clearly specified where appropriate.

---

## 2. Visual direction: make it LOUD, not slow

### Art direction

**A digital-engineering launch experience**: oversized typography, massive black/ink canvas, industrial grid lines, cybernetic 3D object, acid-lime primary accent, ultraviolet glows, restrained coral highlights, asymmetric editorial blocks, deliberate whitespace, hard cuts plus fluid motion.

#### Suggested design tokens

```css
:root {
  --bg: #08090c;
  --surface: #14161c;
  --surface-raised: #1d2029;
  --text: #f4f5f7;
  --muted: #9ea3ae;
  --accent: #c5ff29;        /* electric lime */
  --accent-secondary: #9656ff; /* ultraviolet */
  --accent-hot: #ff694e;   /* rare highlights */
  --border: rgba(255, 255, 255, 0.14);
  --radius: 18px;
}
```

- Display type: **Syne** or **Space Grotesk** (verify actual font license); body: **Inter**; technical labels: **JetBrains Mono**.
- Use **very large fluid headings** with `clamp(...)`, expressive line breaks, and uppercase hero keywords.
- Use high-contrast editorial layouts, NOT a wall of neon glowing boxes.
- Hero typography and navigation must remain HTML text, never texture inside Canvas.
- Animation should draw attention to the work rather than hide it.
- White/near-white text must be readable on dark surfaces; check WCAG contrast, including lime-on-light areas.

### Home sections (in order)

| Section | Content | Signature animation | Notes |
|---|---|---|---|
| 01 Navigation | Monogram DZ, Work / About / Stack / Contact, CV link | Underline trace + entrance | Sticky, compact, keyboard-friendly |
| 02 Hero | Large promise, role, 2 CTAs | **Procedural 3D chromed/lime object** floating, reacts to pointer + scroll; text reveal | Above-the-fold priority |
| 03 Selected work | 3–5 case-study cards | Cards tilt subtly, directional reveals, project image parallax | Actual work above gimmicks |
| 04 About | Concise engineering story, photo optional | Mask reveal / animated grid / split panels | Personal, no cliché skill percentages |
| 05 Skills / capabilities | Drupal, backend, frontend, cloud, animation, performance | Animated orbit or simple 3D skill constellation | Ensure plain-text accessible version |
| 06 Experience | Verified roles and timeline | Staggered editorial timeline | No fabricated history |
| 07 Playground (optional) | Micro-interaction demos, shaders, UI experiments | Interactive mini 3D experiments | Lazy load only on interaction |
| 08 Contact | Giant statement + email/social links | Magnetic CTA + text transition | Easy contact in 1 click |
| 09 Footer | Copyright, source links, back to top | Minimal | Include privacy note if analytics used |

### Three signature interactions

**A. Hero — the core WOW moment**
- A premium abstract “engineering core” constructed from one procedural TorusKnot or custom geometry, brushed dark surface and lime edge/ultraviolet lighting.
- Slow organic idle motion and pointer parallax on desktop only.
- First load shows readable headline immediately; 3D loads as a secondary layer.
- On scroll, object rotates/recedes while text changes scale; no full-screen blocking loader.
- Fallback: lightweight CSS/SVG graphic if WebGL fails or reduced motion is requested.

**B. Project gallery — 3D-like without another WebGL scene**
- Project cards use CSS perspective and GPU transforms; GSAP handles entry choreography.
- Hover reveals stack/role in one clean overlay, without making title/links disappear.
- Do not use hover as the only way to access information; touch devices show project information directly.

**C. Contact — unforgettable finish**
- Large marquee-like statement: “LET'S BUILD SOMETHING BIG.”
- A magnetic (but accessible) CTA tracks pointer slightly; touch/keyboard stays stationary.
- Accessible social links, clear `mailto:` destination; optional copy-email button.

### Scroll narrative storyboard

1. **0–20%:** hero typography slides/reveals; object floats at center-right.
2. **20–40%:** the object scales down and projects emerge in split/bento compositions.
3. **40–65%:** project imagery reveals with masks and subtle depth.
4. **65–80%:** about and verified experience; typography carries the narrative.
5. **80–100%:** dramatic but short contact reveal, then no forced movement.

Use GSAP ScrollTrigger only for sections where it adds meaning. Avoid animating every line and avoid long scroll-jacking sequences.

---

## 3. Technology stack details

### Required

- **React (stable)**: accessible reusable components.
- **TypeScript**: typed project content and props.
- **Vite**: local dev and static build (`dist/`).
- **Tailwind CSS v4**: utility layouts combined with your custom CSS design system.
- **Three.js**: 3D primitives and shader/lighting foundation.
- **`@react-three/fiber`**: scene renderer; use the React-compatible **stable** release. For React 19, choose React Three Fiber v9; avoid v10 alpha for MVP.
- **`@react-three/drei`**: useful 3D helpers (e.g., Float).
- **GSAP + ScrollTrigger + `@gsap/react`**: page transitions, reveals, stagger, scroll progress; GSAP React hook handles teardown.
- **Lucide React**: basic UI icons.

### Optional, not default

- **Lenis**: only after testing native scrolling, focus, anchors, mobile Safari, and reduced motion. Keep native scroll on touch if smoother is not genuinely better.
- **Blender**: create a custom compressed `.glb` if procedural geometry is insufficient. Export with optimized materials and polygon counts.
- **Sentry / Cloudflare Web Analytics**: optional diagnostics/analytics; understand privacy implications and free-tier limits.
- **Lighthouse/Playwright**: audits and browser smoke tests.

### Why not a Drupal or Next.js backend for this MVP?

A single-page personal portfolio with editable local content needs no server, database, authentication, or CMS. Adding Drupal would complicate a free-hosting goal. React/Vite static deployment keeps time-to-first-content and maintenance low while allowing all the 3D interaction. If later you want a blog, hundreds of projects, multilingual routes, or a headless editorial workflow, re-evaluate **Astro** or **Next.js + Drupal** with a compatible hosting strategy.

---

## 4. System prerequisites (MacBook Air M1)

Install/use:

1. **Node.js 22 LTS** (or a supported stable version meeting Vite's current minimum). Vite currently requires Node.js **20.19+ or 22.12+**.
2. npm (bundled with Node).
3. Git.
4. VS Code or Cursor (optional AI coding editor).
5. Google Chrome and Safari for cross-browser checks.
6. GitHub account and free Cloudflare account for the recommended deployment path.

Run:

```bash
node -v
npm -v
git --version
```

If Node is missing/outdated, use the official Node.js LTS installer or a version manager such as `nvm`. No PHP, Composer, Docker, Drupal, or paid tool is required for this portfolio.

---

## 5. Bootstrap the codebase — exact commands

```bash
# 1. Create a React + TypeScript + Vite project.
npm create vite@latest danyal-portfolio -- --template react-ts

# 2. Move inside.
cd danyal-portfolio

# 3. Install scaffolded dependencies.
npm install

# 4. Install animation, 3D and icon dependencies.
npm install three @react-three/fiber @react-three/drei gsap @gsap/react lucide-react

# 5. Optional smoother: introduce only if needed.
# npm install lenis

# 6. Install Tailwind v4 Vite integration and Three types.
npm install -D tailwindcss @tailwindcss/vite @types/three

# 7. Run locally.
npm run dev
```

Visit the local URL printed by Vite (normally `http://localhost:5173/`).

### Configure Tailwind v4

Edit `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

At the top of `src/index.css`:

```css
@import 'tailwindcss';

html { scroll-behavior: smooth; }
body { background: #08090c; color: #f4f5f7; }
```

If Lenis is later enabled, let Lenis/GSAP own scrolling rather than running conflicting scroll-smoothing approaches. Always test anchors and keyboard navigation.

---

## 6. Recommended repository structure

```text
danyal-portfolio/
├── public/
│   ├── favicon.svg
│   ├── og-cover.jpg                 # social share card; create original asset
│   ├── Afaq_Raza_Drupal_Developer.pdf # approved CV, optional
│   ├── images/
│   │   ├── projects/               # AVIF/WebP thumbnails + fallback
│   │   └── profile.webp
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/{Button,MagneticLink,SectionHeading}.tsx
│   │   ├── layout/{Header,Footer}.tsx
│   │   ├── three/{HeroScene,HeroOrb,SceneFallback}.tsx
│   │   └── effects/{TextReveal,RevealOnScroll,ProjectCard}.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── FeaturedWork.tsx
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Experience.tsx
│   │   └── Contact.tsx
│   ├── data/
│   │   ├── profile.ts
│   │   ├── projects.ts
│   │   └── experience.ts
│   ├── hooks/
│   │   └── useReducedMotion.ts
│   ├── styles/
│   │   └── design-tokens.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

No component should hardcode career facts: keep profile, jobs, case studies, contacts, URLs, and approved credentials in typed data files. Provide a clearly labeled placeholder if unavailable.

---

## 7. Implementation milestones (do these in order)

### Phase 1 — Foundation and content (day 1)

- [ ] Confirm headline, role, summary, work history, CV, contact email, and verified certifications.
- [ ] Curate three projects worth showing publicly; secure screenshot permissions.
- [ ] Create the Vite app, Tailwind design tokens, and semantic layout.
- [ ] Build mobile-first static sections BEFORE adding animation.
- [ ] Ensure top navigation anchors work with JavaScript and reduced motion.

**Definition of done:** a simple accessible website that clearly explains who you are, what you built, and how to reach you.

### Phase 2 — Design system (day 2)

- [ ] Create header, typography scale, buttons, section containers, spacing and grid.
- [ ] Design responsive hero with HTML headline and secondary art area.
- [ ] Implement project cards with visible role, title, stack, and meaningful outcome (if confirmed).
- [ ] Add about, verified timeline, and contact sections.
- [ ] Check at ~360px, 390px, 768px, 1024px, 1440px widths.

**Definition of done:** visually striking even with every animation turned off.

### Phase 3 — Hero WebGL (day 3)

- [ ] Implement one lazy-loaded React Three Fiber Canvas.
- [ ] Add lightweight procedural hero geometry and lights.
- [ ] Pointer parallax only when mouse/fine pointer is present.
- [ ] Scroll-linked motion with a shared motion state or GSAP orchestration.
- [ ] Add CSS/SVG fallback for WebGL unavailable, reduced motion, and low-power devices.
- [ ] Limit DPR and use compressed texture assets; no giant GPU effects.

**Definition of done:** impressive 3D, readable hero in all cases, no content loading blocker.

### Phase 4 — GSAP motion (day 4)

- [ ] Hero title stagger/mask reveal with ~0.5–1.2 second max choreography.
- [ ] Section reveal sequences using ScrollTrigger and `@gsap/react` for cleanup.
- [ ] Work cards subtle depth and hover, with touch and keyboard equivalents.
- [ ] One selected pinned or scrubbed transition, not five.
- [ ] Use `prefers-reduced-motion` to remove nonessential transitions.

**Definition of done:** motion enhances hierarchy and never traps the user.

### Phase 5 — Optimization and testing (day 5)

- [ ] Lazy-load the 3D chunk after essential HTML/CSS; add static poster.
- [ ] Preload only critical font(s) and optimize WebP/AVIF thumbnails.
- [ ] Keep animation transforms/opacity-based; avoid constant layout reflow.
- [ ] Test Safari/macOS, mobile Safari, Chrome, and low-spec emulation.
- [ ] Test keyboard, screen reader labels, forced reduced motion, touch/no hover.
- [ ] Run Lighthouse mobile and desktop, fix meaningful blockers.
- [ ] Run `npm run build` and inspect actual output sizes.

**Definition of done:** no broken links or console errors; hero and cards responsive and smooth.

### Phase 6 — Publish and iterate (day 6)

- [ ] Finalize meta title, description, OG preview image, robots.txt and sitemap.xml.
- [ ] Publish repo and deploy Cloudflare Pages.
- [ ] Verify live URL, HTTPS, mobile and CTA paths.
- [ ] Add the live portfolio URL to LinkedIn profile's Featured/contact section.
- [ ] Update projects when new approved work or proof becomes available.

**Definition of done:** live public site on a no-cost `pages.dev` address.

---

## 8. Reference implementation — simple, working starter 3D

This example demonstrates the *technique*, not a finished design. Place it in `src/components/three/HeroScene.tsx`.

```tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Mesh } from 'three';

function Core() {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.18;
    mesh.current.rotation.x += delta * 0.07;
    // Subtle interpolation rather than snapping to pointer coordinates.
    const targetY = state.pointer.x * 0.16;
    mesh.current.position.x += (targetY - mesh.current.position.x) * 0.025;
  });

  return (
    <mesh ref={mesh}>
      <torusKnotGeometry args={[1.0, 0.28, 140, 20]} />
      <meshStandardMaterial
        color="#c5ff29"
        metalness={0.62}
        roughness={0.22}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      aria-label="Abstract animated 3D sculpture"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[2, 3, 3]} intensity={3.5} color="#ffffff" />
      <pointLight position={[-3, -1, 2]} intensity={10} color="#9656ff" />
      <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.28}>
        <Core />
      </Float>
    </Canvas>
  );
}
```

### Lazy-load it in the hero

```tsx
import { lazy, Suspense } from 'react';

const HeroScene = lazy(() => import('../components/three/HeroScene'));

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Suspense fallback={<div className="hero-scene-poster" />}>
          <HeroScene />
        </Suspense>
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-lime-300">
            Senior Full-Stack Drupal Developer · Creative Web Engineering
          </p>
          <h1 className="mt-4 max-w-4xl text-6xl font-black uppercase leading-none md:text-8xl">
            I build digital experiences that move.
          </h1>
          <a href="#work" className="mt-8 inline-block rounded-full bg-lime-300 px-7 py-4 font-bold text-black">
            Explore work
          </a>
        </div>
      </div>
    </section>
  );
}
```

**Production changes required:** `Canvas` creates motion and an animated WebGL context. The finished implementation MUST select a **static fallback** instead of mounting WebGL when reduced-motion is requested, WebGL is unavailable, or device capability is very limited. Hide decorative scenes from assistive technology (`aria-hidden` on the wrapper); provide useful meaning in HTML instead. On mobile, consider a static hero art asset instead of continuous rendering. Add error boundaries, lazy-loading strategy and test interaction before shipping.

### GSAP React pattern

```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function RevealHeading() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.from('[data-reveal]', {
      y: 48,
      opacity: 0,
      duration: 0.75,
      ease: 'power3.out',
      scrollTrigger: { trigger: scope.current, start: 'top 85%', once: true },
    });
  }, { scope });

  return <div ref={scope}><h2 data-reveal>SELECTED WORK.</h2></div>;
}
```

**Avoid stacking libraries indiscriminately**: GSAP covers most timeline and reveal needs; don't add Framer Motion just because examples use it. Use CSS transitions for very small UI feedback.

---

## 9. Recommended content data shape

```ts
export type PortfolioProject = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  role: string;
  year?: string;
  stack: string[];
  cover: string;
  href?: string;
  contributions: string[];
  outcome?: string; // Only if verified, never guessed.
  approvedForPortfolio: boolean;
};

export const projects: PortfolioProject[] = [
  {
    id: 'example-project',
    title: 'EXAMPLE — REPLACE WITH APPROVED WORK',
    eyebrow: 'CUSTOM DRUPAL EXPERIENCE',
    summary: 'Describe the real challenge, target audience, and UX goal.',
    role: 'Confirm your role here',
    stack: ['Drupal', 'Twig', 'JavaScript'],
    cover: '/images/projects/placeholder.webp',
    contributions: ['Replace with your real engineering contributions'],
    approvedForPortfolio: false,
  },
];
```

Render only `projects.filter(p => p.approvedForPortfolio)`. During development, create a clearly labeled “concept/demo” item or placeholder rather than misleading production client claims.

### Case study template

- Project name and clear context.
- Problem/constraints (2–3 lines).
- Role / collaborators / responsibility.
- Technical decisions and why.
- Screenshots, interactions or live demo with permission.
- Outcome if actually measurable (with the source of the metric).
- What you learned / what you would improve.

---

## 10. Performance targets (goals, NOT guaranteed scores)

### Hard guardrails

- Real HTML headline and CTAs visible before 3D finishes loading.
- One primary animated WebGL scene, not 3 separate always-running Canvases.
- Cap device pixel ratio around 1–1.5 where appropriate; reduce detail/turn off lights and postprocessing on lower-end devices.
- Use idle/suspended/on-demand rendering when possible; truly continuous animation requires a continuous render loop.
- Prefer a 3D scene without giant external models. If GLB used, compress geometry/textures, inspect actual network payload.
- SVG/UI illustrations and CSS effects are preferred for non-hero interactions.
- Project screenshots use `width`/`height` or `aspect-ratio` to prevent layout shift.
- Use native `loading="lazy"` on below-the-fold screenshots; **do not lazy-load the LCP hero text/image**.
- Avoid autoplay background videos, unnecessary heavy blur filters and full-screen postprocessing.
- Avoid `will-change` on every element; apply selectively.
- Test keyboard navigation and low-power/thermal behavior on the MacBook Air M1 and real phones.

### Success metrics

| Metric | Aim |
|---|---|
| Largest Contentful Paint (LCP) | ≤ 2.5 s at the 75th percentile |
| Interaction to Next Paint (INP) | ≤ 200 ms at the 75th percentile |
| Cumulative Layout Shift (CLS) | ≤ 0.1 at the 75th percentile |
| Lighthouse mobile performance | Aim 90+; 3D might require tradeoffs |
| Accessibility and SEO | Aim 95–100; audit rather than assume |
| FPS on capable desktop | Target approximately 60 with no major interaction stutter |
| Reduced motion | Equivalent content and interaction without continuous effects |

These are **goals**. Actual scores depend on assets, runtime/device, network, real code and testing; it is not credible to guarantee “Lighthouse 100” with a heavy realtime 3D experience on all devices.

### Accessibility and resilience checklist

- [ ] Semantic HTML section landmarks / headings (one H1).
- [ ] All CTAs keyboard reachable; visible focus states.
- [ ] Skip-to-content link.
- [ ] No keyboard trap from sticky/pinned scroll effects.
- [ ] Text contrast checked.
- [ ] CSS respects `prefers-reduced-motion`.
- [ ] Screen reader receives meaningful content even if Canvas is hidden.
- [ ] `aria-hidden` only on decorative 3D, not important content.
- [ ] Touch user is not forced to hover.
- [ ] No sound autoplay.
- [ ] WebGL fallback exists and is tested.

---

## 11. SEO, recruiter UX, and privacy

### In `index.html`

```html
<title>Danyal Zeb — Full-Stack Drupal Developer & Creative Web Engineer</title>
<meta name="description" content="Portfolio of Danyal Zeb — full-stack Drupal engineering, modern web experiences, and interactive frontend development." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="Danyal Zeb — Creative Web Engineering" />
<meta property="og:description" content="Digital experiences engineered to move." />
<meta property="og:type" content="website" />
<!-- Set og:image and og:url to final absolute live URLs after deployment. -->
```

- Add favicon, original Open Graph cover, `robots.txt`, and `sitemap.xml` after confirming the deployed URL.
- Make site content **crawlable**; a one-page Vite SPA is workable for a simple portfolio, but pre-render or adopt Astro/Next.js if you later need independently indexed case-study pages and a blog.
- Check share preview using LinkedIn Post Inspector after publication.
- Do not publish personal phone/address unless you really want them indexed and accessible.
- If analytics/cookies are enabled, understand consent and regional privacy obligations.
- Keep a prominent **Download CV** link once you have an approved PDF.

---

## 12. Publish FREE on Cloudflare Pages (recommended GitHub method)

### Step A — Create your GitHub repository

Go to <https://github.com/new> and create a new empty repository named `danyal-portfolio` (no README/gitignore at repository creation if already present locally).

**Note:** A Bitbucket SSH key does not automatically authorize access to GitHub. This example uses HTTPS; use GitHub's authenticated login/credential manager, or separately configure a GitHub SSH key.

```bash
# From inside danyal-portfolio/
npm run build

git init
git add .
git commit -m "Initial 3D portfolio"
git branch -M main

git remote add origin https://github.com/CodewithAfaqRaza/Developer_Porfolio.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME`; use the login flow offered by Git Credential Manager/GitHub Desktop or an authorized token as applicable. Never commit keys, tokens or secrets.

### Step B — Connect Cloudflare Pages

1. Create/sign in to a Cloudflare account at <https://dash.cloudflare.com/>.
2. Open **Workers & Pages**.
3. Choose **Create application → Pages → Connect to Git** (the dashboard wording may change).
4. Select **GitHub** and authorize access to the repository.
5. Select `danyal-portfolio`.
6. Configure:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | `React (Vite)` if available; otherwise custom |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (unless repository structure differs) |

7. Choose **Save and Deploy / Deploy**.
8. After a successful build, visit the assigned `https://YOUR-PROJECT.pages.dev` link.
9. Confirm links, OG tags, HTTPS, desktop and mobile behavior.

Every push to `main` triggers an updated deployment. Cloudflare Pages Free currently lists **500 builds per month** (other free-tier limits apply), which is more than enough for a personal portfolio in normal usage.

### Step C — Get the best free URL

Try a memorable project name during creation, e.g. `Developer_Portfolio`; availability is not guaranteed.

Examples (illustrative, **not existing verified URLs**):

- `https://danyal-zeb-portfolio.pages.dev`
- `https://danyalbuilds.pages.dev`

You can share the final `.pages.dev` URL publicly, on a CV, in email signatures and on LinkedIn. It has HTTPS without buying a registered domain.

### Step D — Updates

```bash
# Whenever content/features change:
npm run build
git add .
git commit -m "Improve work section"
git push
```

Cloudflare rebuilds your latest version automatically.

### If you want to keep Bitbucket instead of GitHub

Cloudflare Pages' native Git integration supports **GitHub and GitLab**, not Bitbucket directly. You can keep the repository in Bitbucket and deploy manually with **Wrangler**:

```bash
npm run build
npx wrangler login
npx wrangler pages project create danyal-zeb-portfolio --production-branch main
npx wrangler pages deploy dist --project-name danyal-zeb-portfolio --branch main
```

The project-create command is only needed once; choose an unused Pages project name. Later, after each successful local build, rerun only the `pages deploy` command. You can also configure a Bitbucket Pipeline for automated Wrangler deploys later, but that adds setup and secret-management work and is unnecessary for the first release.

### After launch

- Verify there are no 404s on reload or deep links (if you added routing).
- Set correct final `og:url`, `og:image`, and sitemap URLs.
- Add the public URL to LinkedIn and CV.
- If you eventually purchase a domain, use **Pages → Custom domains** to attach it; hosting can stay on the free tier subject to limits.

---

## 13. No-cost and optional-cost breakdown

| Service | Initial choice | Expected recurring cost |
|---|---|---|
| React, Vite, Three, GSAP | Open-source/free use under their respective licenses | $0 |
| Tailwind and Lucide | Free | $0 |
| GitHub repository | Free account | $0 |
| Cloudflare Pages | Free tier for static hosting | $0 within applicable limits |
| `.pages.dev` subdomain | Included with Pages | $0 |
| Contact through email links | `mailto:` | $0 |
| Image optimization | Local/open-source CLI or manual | $0 |
| Custom `.com` / `.dev` | **Not included** | Paid registration/renewal |
| Paid fonts/3D models/contact SaaS | Avoid for MVP | Optional and variable |

**Don't assume** a “free domain registration” deal is safe or permanent. Free *subdomain* + free host is the dependable $0 route.

---

## 14. AI coding agent: master implementation prompt (copy into Cursor/Claude/Codex)

> Use this prompt after initializing the Vite project or give this entire Markdown file to the agent. Keep checkpoints small and review source code and copy before publishing.

```text
You are a principal creative frontend engineer, 3D web developer and accessibility-focused performance specialist.

Build a production-ready personal developer portfolio for Danyal Zeb from the attached MASTER PLAN. The design must feel like a high-end Awwwards-inspired digital engineering studio, not a generic Tailwind resume template. Hero positioning: "I BUILD DIGITAL EXPERIENCES THAT MOVE." Tone: bold, editorial, technically sophisticated; dark neo-brutalist visual language, acid lime #C5FF29, ultraviolet #9656FF, near-black #08090C, and very limited coral accents.

CORE STACK
- React + TypeScript + Vite static SPA.
- Tailwind CSS v4 and custom CSS design tokens.
- Three.js + React Three Fiber (React-19-compatible stable release) + Drei.
- GSAP + ScrollTrigger + @gsap/react; optional Lenis only if proven safe and performant.
- Lucide React.
- Cloudflare Pages free deployment with build command "npm run build" and output "dist".
- No server, no DB, no authentication, no paid dependencies, no stock hero templates.

QUALITY BAR
- Visuals must be distinctive and LOUD, but readability, mobile experience, keyboard use, SEO and speed come first.
- Create an abstract lightweight 3D hero scene (e.g. engineered knot / toroidal core) with premium lighting, smooth subtle idle rotation, fine-pointer parallax and deliberate scroll storytelling.
- Do NOT put the hero headline inside WebGL; HTML must paint immediately.
- Lazy-load WebGL, keep one Canvas, limit DPR and materials, provide static CSS/SVG fallback for reduced motion/WebGL unavailable/low-power environments.
- Strong but curated GSAP heading reveals, sticky navigation, featured project layouts, CSS 3D hover on desktop, responsive experience timeline, dramatic contact CTA.
- Support keyboard users, touch devices, 360px+ screens, WCAG fundamentals and prefers-reduced-motion. Never trap scroll, never rely on hover-only controls, never autoplay sound.
- Honor HTML semantics; add skip link, proper heading hierarchy, focus-visible states, color contrast, descriptive alt text, SEO metadata, sitemap/robots and correct external-link rel attributes.
- Code architecture: src/components/{ui,layout,three,effects}, src/sections, src/data, src/hooks, src/styles. Type all content and props.
- Avoid adding unnecessary frontend libraries, giant textures, cinematic videos, heavy shader postprocessing, or a long loading screen.

CONTENT INTEGRITY
- The LinkedIn URL is https://www.linkedin.com/in/danyal-zeb-4a1571249/ but was not machine-readable. Do not scrape or invent years of experience, verified certifications, employers, job dates, degrees, awards, metrics or testimonials.
- Display Danyal Zeb by name. The proposed role is "Senior Full-Stack Drupal Developer & Creative Web Engineer" but leave editable in src/data/profile.ts.
- Candidate project content can refer to Drupal architecture, interactive ticketing interfaces, React, performance, event-platform development and multilingual UX, but ANY real client identity/details are gated by portfolio approval and accurate attribution.
- Put all career/project/contact data in src/data/*.ts with TODO markers for unverified content. Do not ship false public claims or broken placeholder links.
- Include clear CTAs for project work, email, LinkedIn and optional download CV. Never fabricate GitHub username or an email.

EXECUTION
1. Audit current files and dependencies; state any assumptions.
2. Implement semantic mobile-first static HTML/React sections with actual layout and design tokens.
3. Implement responsive art direction and fluid typography; inspect overflow at 360, 390, 768, 1024 and 1440 widths.
4. Add lazy-loaded React Three Fiber hero and static fallback.
5. Add purposeful GSAP animations with proper lifecycle cleanup.
6. Add SEO metadata, original OG image placeholder, site icon, robots and sitemap instructions.
7. Optimize assets, split chunks and avoid unnecessary re-rendering.
8. Run typecheck, lint, build, browser smoke checks, Lighthouse and accessibility checks where available. Report actual results only, not invented scores.
9. Include README.md containing local commands, GitHub workflow, Cloudflare Pages deployment, domain setup, and instructions for editing data.
10. Return a short file-by-file implementation summary and known TODOs. Never claim production readiness if tests did not run.

EXPECTED RESULT
A visually stunning, fast, serious, technically credible interactive portfolio with distinctive 3D motion and zero-cost deployability. Build iteratively and favor quality over quantity.
```

---

## 15. Final pre-launch checklist

**Content**
- [ ] Real personal and employment details verified.
- [ ] Project screenshots and client references approved.
- [ ] Real email, LinkedIn/GitHub URLs present.
- [ ] Correct CV link or hide button until CV is ready.

**Visual / interactions**
- [ ] Big typographic impact without desktop-only layout.
- [ ] Smooth 3D on capable desktops; graceful fallback everywhere else.
- [ ] Animations never block hero text, links, or scrolling.
- [ ] Form/contact links and navigation actually work.

**Engineering**
- [ ] TypeScript build clean.
- [ ] Vite production build clean.
- [ ] Core Web Vitals measured (not guessed).
- [ ] Images compressed; 3D costs inspected.
- [ ] No secrets, personal addresses, or unauthorized client data in Git.
- [ ] Accessibility/motion/keyboard checks passed.
- [ ] OG preview and metadata valid on the public URL.

**Deployment**
- [ ] Free Pages subdomain publicly reachable over HTTPS.
- [ ] GitHub auto-deploy connected or Wrangler manual path confirmed.
- [ ] Site linked from LinkedIn.
- [ ] Optional later: pay for a memorable custom domain only when ready.

---

## 16. Official references (re-check versions as you build)

- Vite: <https://vite.dev/guide/>
- React Three Fiber: <https://r3f.docs.pmnd.rs/>
- Drei: <https://drei.docs.pmnd.rs/>
- R3F performance: <https://r3f.docs.pmnd.rs/advanced/scaling-performance>
- GSAP ScrollTrigger: <https://gsap.com/docs/v3/Plugins/ScrollTrigger/>
- GSAP React hook: <https://www.npmjs.com/package/@gsap/react>
- Lenis: <https://github.com/darkroomengineering/lenis>
- Cloudflare React/Pages setup: <https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/>
- Cloudflare Pages limits: <https://developers.cloudflare.com/pages/platform/limits/>
- Cloudflare Pages Git support: <https://developers.cloudflare.com/pages/configuration/git-integration/>
- Wrangler Pages commands: <https://developers.cloudflare.com/workers/wrangler/commands/pages/>
- Lighthouse/Web Vitals: <https://web.dev/articles/vitals>
- WCAG: <https://www.w3.org/WAI/standards-guidelines/wcag/>

---

## 17. Suggested next action (the highest-impact one)

Before adding animations, write the **three strongest case studies** with real screenshots and your specific technical contribution. An incredible WebGL hero catches attention; credible project stories turn that attention into interviews, clients, and opportunities.

Then use the master prompt above to generate the first static React UI, review it, and add the 3D + GSAP layers one at a time.
