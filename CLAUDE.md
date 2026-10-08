@AGENTS.md

# mostafaosama — portfolio

Personal site for Mostafa Osama: full stack developer with a backend lean (Onvaca, since 08/2024).
Audience: engineering managers and tech leads hiring full-stack engineers. Recruiters are secondary.
After 30 seconds a visitor should think: "He builds systems that hold up under load, and he cares about the details."

The design direction is **Trace**: the site borrows the visual grammar of a distributed trace
(spans, a critical path, durations), used quietly. Reference specimen:
https://claude.ai/artifact/KvFQhxegFkkhwmkBNNAdJP

These rules are binding. If a change needs to break one, say so and ask first.

## Stack

- Next.js 16 (App Router, Turbopack, `cacheComponents`), React 19, TypeScript.
- Tailwind CSS v4. Tokens live in `src/app/globals.css` under `@theme`; never hard-code a color or font in a component.
- GSAP 3 (`gsap`, `@gsap/react`) is the only animation library. No Motion/Framer, no CSS keyframe libraries.
- MDX for writing (`content/writing/*.mdx`).
- Everything is statically prerendered. No runtime data fetching, no database, no analytics scripts.

## Tokens

Colors (light is the primary design; dark follows `prefers-color-scheme`):

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#F6F7F5` | `#101317` | page background |
| `ink` | `#14171A` | `#E8EAED` | text, primary marks |
| `muted` | `#646B72` | `#9AA1A9` | secondary text, axis labels |
| `hairline` | `#DDE0E3` | `#262B31` | rules, dashed track lines |
| `span` | `#B9C0C7` | `#3A4149` | non-critical span bars |
| `crit` | `#2337C6` | `#8C9BFF` | the critical path (Onvaca), focus rings, link hover |
| `err` | `#C4281C` | `#FF6B5E` | errors and the 404 span only |

`crit` is the only accent. Do not introduce another hue. `err` appears only where something failed.

Type: **Instrument Sans only** (variable, `wdth` 75–100, `wght` 400–700). No second family. No monospace, except code inside writing posts (system `ui-monospace`).

| Role | Size / line height | Weight | Notes |
|---|---|---|---|
| Name | 20 / 28 | 600 | `tracking-[-0.01em]` |
| Page title (writing post, lab item) | 30 / 34 | 600 | `tracking-[-0.015em]`, `text-wrap: balance` |
| Body | 17 / 28 | 400 | max 62ch |
| Small / secondary | 14 / 20 | 400 | `muted` |
| Span label | 14 / 20 | 400–600 | `font-stretch: 85%` |
| Figures (dates, durations, counts) | inherit | inherit | always `tabular-nums` |

Never: all-caps labels, letter-spaced eyebrows, a single accented word inside a headline, emoji.

Layout:

- One left-aligned column, `max-w-[40rem]` (640px), side gutter 16px minimum (24px from `sm`).
- Only the trace may break out wider (up to `56rem`) on large screens. Nothing else does.
- Vertical rhythm in multiples of 4px. Sections are separated by space, not by boxes or cards.
- No cards, no shadows, no gradients, no rounded "panels". Radius only on span bars (2px) and focus rings.

## Motion

Every animation must guide attention, show a relationship, or reward exploration. Decoration gets cut.

- **One signature interaction per page.** Current signatures:
  - Home: the trace. Spans draw once on first load (≈900ms total, `power2.out`, ending on the critical path). Expanding a project entry grows its span and unfolds its details; this is the same signature, not a second one.
  - Lab index: hovering or focusing an experiment shows its preview. Nothing else moves.
  - 404: the request span draws and turns `err`.
  - Writing: no signature. Static.
- Durations 150–600ms; nothing loops on the main site (experiments may).
- No scroll-triggered fade/slide entrances, no parallax, no cursor followers, no hover scale. Hover may change color only.
- Everything must render complete with JavaScript disabled or animations skipped. Animate *from* the visible state's opposite at runtime (`gsap.from`), never leave content at `opacity: 0` in CSS.
- **Reduced motion is mandatory**: wrap every GSAP effect in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`; the reduced path jumps to the end state. Test it with Playwright `emulateMedia({ reducedMotion: 'reduce' })`.
- GSAP is loaded only by client components that need it (`"use client"` leaf components). Server components never import it.

## Content rules

- Voice: calm and confident. Dry humor only on the 404 and in the Lab.
- No case studies. Projects are short entries; details live in the source repo or the official site.
- Never invent numbers. Every figure on the site must be checkable (GitHub, Bitbucket counts, CV). Placeholders are marked `TODO(mostafa)` in code, never shipped as if real.
- Onvaca is closed source: describe what was built in public-safe terms only. No ticket numbers, internal names, or customer data.
- Sentence case everywhere. No "Hi, I'm…" hero, no tech-logo grids, no skill bars, no testimonials.

Source of truth for content: `src/content/` (`site.ts`, `career.ts`, `projects.ts`, `lab.ts`, `writing/*.mdx`).

## Structure

- `/` Home: name, bio, career + projects trace (expandable), writing list (hidden until a non-draft post exists), lab link, contact.
- `/writing`, `/writing/[slug]`: MDX posts in `src/content/writing/*.mdx`, each with an `export const metadata = { title, description, date, draft? }`. `draft: true` posts 404 in production (they stay in `generateStaticParams`, which may not return an empty list under Cache Components).
- `/lab`, `/lab/[slug]`: experiments. **Each experiment is isolated** in `src/lab/<slug>/`:
  - `model.ts`: a pure, seeded simulation (no React). Verify its numbers before touching the UI.
  - `chart.tsx`: pure SVG/markup, safe on the server. Compact previews draw each series as one `<path>`.
  - `Experiment.tsx`: the client view, `export default`.
  - `Preview.tsx`: a server-rendered still of the model's real output for the lab index.
  - The app reaches experiments only through `src/lab/Loader.tsx` (client: `next/dynamic` with `ssr: false`, a `catchError` boundary per experiment, and a reserved min-height per experiment to avoid layout shift) and `src/lab/previews.tsx` (server). `src/app/lab/[slug]/error.tsx` is the second line of defence.
  - Experiments may import only `@/components/LabFrame` and `@/lab/shared/*` from outside their folder. Nothing outside `src/lab/` imports an experiment directly.
  - Isolation was verified by forcing a throw: the fallback renders, the rest of the page and sibling experiments keep working.
- 404: `src/app/not-found.tsx` (a request trace whose last span fails). Unknown top-level paths return HTTP 404. Unknown slugs under `/writing/` and `/lab/` return 200 with `noindex`: their pages stream from a prerendered shell, and `dynamicParams` is not allowed with Cache Components. This is expected.
- Dynamic route pages keep the shell URL-independent: `params` is awaited inside a `<Suspense>` child (partial prefetching). Links to those pages use `prefetch`.
- Portrait: `node scripts/portrait/build.mjs <photo>` writes `public/portrait-mask.png` and `public/portrait-mask-dark.png` (ordered dither, drawn as a CSS mask filled with `ink`; the dark one is inverted so dark mode isn't a negative). `Portrait` renders nothing until those files exist. Never commit the source photo.
- CV: `public/mostafa-osama-cv.pdf`, generated by `scripts/cv/build.py` (FlowCV layout replicated in PT Serif). Edit the content there and re-render; do not hand-edit the PDF.

## Quality bar (check before calling anything done)

- Keyboard: every interactive element reachable and operable, visible focus ring (`crit`, 2px, offset 3px).
- Mobile: no horizontal scroll at 360px; trace labels stay readable (stack label above bar under 640px).
- Lighthouse (mobile, production build): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- After each page change: Playwright screenshots at 1440×900 and 390×844, light and dark, plus one reduced-motion pass. Compare against the specimen and these rules.
- `npm run lint`, `npx tsc --noEmit` and `npm run build` pass with no warnings. Format with `npm run format` (Prettier, 120 columns).
- Lighthouse: `npm run build && npx next start -p 3200`, then `CHROME_PATH=<playwright chromium> npx lighthouse http://localhost:3200/<page> --output=json`. Baseline at launch (mobile): Performance 97–98, everything else 100.
