@AGENTS.md

# mostafaosama: portfolio

Personal site for Mostafa Osama, full stack developer with a backend lean (Onvaca, since 08/2024).
Audience: engineering managers and tech leads hiring full-stack engineers. Recruiters are secondary.

**Status: restarted from zero on 2026-10-13.** The previous "Trace" design was rejected and is kept only
as the local git tag `trace-v1`. Do not bring its patterns back unless asked. The new design is being
built step by step; the only settled piece so far is the background below.

## Stack

- Next.js 16 (App Router, Turbopack, `cacheComponents`), React 19, TypeScript, Tailwind CSS v4.
- Colours live as CSS variables in `src/app/globals.css` (`--paper`, `--ink`, `--muted`), exposed to Tailwind.
- Static by default. Vercel builds with Node 22 (`engines`) and `next build` (`vercel.json`); the dashboard
  still has 2023 settings that these override.

## Background: CornerGlow (settled, keep these constraints)

`src/components/CornerGlow.tsx` renders React Bits' Grainient as a soft glow in the top-right corner. The
owner's brief: use the library's effect, in the corner, a small area of the screen, good colours, never
distracting, hover working, light mode handled.

- **Grainient is library code, unmodified.** Installed with `npx shadcn@latest add @react-bits/Grainient-TS-TW`
  (registry configured in `components.json`) into `src/components/Grainient.tsx`. Never edit it; re-run the
  command to update it. It is excluded from ESLint and Prettier for that reason (it writes a ref during render).
- **`reactStrictMode: false`** in `next.config.ts`: Grainient destroys its WebGL context in cleanup, and dev-only
  Strict Mode re-runs effects on the same canvas, so the glow never draws in `next dev`. Production is unaffected.
  For the same reason keep CornerGlow in the **root layout**: a page segment can be hidden and re-shown by React
  `<Activity>` (Cache Components), which would re-run the effect on a dead context.
- **All glow settings live in `src/components/glow.settings.json`** (validated by `parseSettings` in `glow.ts`).
  Tune them in the dev-only studio (below) rather than by hand.
- Placement: a box `reach` (vmin, capped at `maxReach` px) square in the top-right corner, clipping a radial square
  twice that size centred on the corner, faded by a radial mask. `attach: "fixed"` keeps it in the corner while
  scrolling; `"page"` lets it scroll away (the box clips, so it never widens the page). Keep it a corner accent,
  not a full-page background.
- **`background`** (default React Bits' near-black `#120f17`) is the dark-mode page colour; light mode is always
  white. `colors` are only the glow's own colours. `glowPalette()` puts the background in front **twice** (a radial
  Grainient is still mid-ramp at its canvas edge; without the repeated stop the glow ends in a ring) and
  pre-compensates it for `contrast`/`saturation`, which Grainient's shader also applies to those stops. Without that,
  contrast 1.39 left a faint dark ring. Light mode is Grainient's own `lightMode` (background stops become white).
- **Grain over the whole site** comes from Grainient itself: a second, full-viewport instance behind the glow with a
  flat background palette, no motion, intro or interaction. It draws once and idles (measured: 0 draws while idle;
  the library still redraws it once per pointer move because it listens on `window`). Its grain is luma-weighted
  like React Bits': strongest in the glow's mid-tones, subtle on the flat page.
- Motion, hover, grain and reach values are whatever the owner saved in the studio; don't override them in code.
- Context loss (GPU reset, sleep and wake): Grainient does not restore its context, so CornerGlow remounts it on a
  fresh canvas (at most 3 times, 1s apart).
- Decoration only: `aria-hidden`, `pointer-events-none` (Grainient tracks the pointer on `window`, so hover still
  works), loaded with `next/dynamic` (`ssr: false`), content above it (`relative z-10`). Reduced motion freezes it
  and turns off the intro and the hover.
- Verify by measuring, not by eye (1440×900, corner crop):
  - falloff along the diagonal descends monotonically to the exact page background with no dip or step (dark = `background`; light 255,255,255);
  - a brisk mouse sweep over the glow changes it visibly (max ≥ 15 levels), a sweep elsewhere doesn't, and reduced motion gives 0;
  - forcing `WEBGL_lose_context` makes it disappear cleanly and come back by itself within ~4s.

## Glow studio (development only)

`npm run dev`, then open `/studio`. It renders the same `CornerGlowView` the site uses over a full, scrolling sample
page, with React Bits' Background Studio controls for Grainient (same ranges), plus Reach / Max reach (with a live
"reaches N px, X% of the width" readout), scroll behaviour, a Light Mode preview and Replay intro. **Save to site**
POSTs to `/studio/save`, which validates and writes `glow.settings.json` (localhost only).

- The page and route are `page.dev.tsx` / `route.dev.ts`. `next.config.ts` only recognises `.dev.*` page extensions
  in the dev-server phase, so production builds don't contain `/studio` at all (verified: 404, no chunk mentions it).
- The site's own CornerGlow hides itself on `/studio`, so only the glow being edited is visible.

## Quality bar

- Respects `prefers-reduced-motion`, fully keyboard accessible, no horizontal scroll at 360px.
- Lighthouse (mobile, production build) Performance ≥ 90. Current home: 100 / 100 / 100 / 100.
- Screenshots with Playwright at 1440×900 and 390×844, light and dark, for every visual change.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass with no warnings. `npm run format` (Prettier, 120 columns).
- When restarting the production server for checks, free the port with `kill $(lsof -tiTCP:3200 -sTCP:LISTEN)`;
  `pkill -f "next start"` misses the `next-server` child and leaves an old build serving.

## Kept from before

- CV: `public/mostafa-osama-cv.pdf`, generated by `scripts/cv/build.py` (see its header).
