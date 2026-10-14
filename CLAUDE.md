@AGENTS.md

# mostafaosama: portfolio

Personal site for Mostafa Osama, full stack developer with a backend lean (Onvaca, since 08/2024).
Audience: engineering managers and tech leads hiring full-stack engineers. Recruiters are secondary.

**Status: restarted from zero on 2026-10-13.** The previous "Trace" design was rejected and is kept only
as the local git tag `trace-v1`. Do not bring its patterns back unless asked. The new design is being
built step by step. Settled so far (2026-10-14): the background, the nav, the inline hero, Arabic, the font and the
buttons. The dev-only studios used to choose them were removed (they're in git history: commit 92242df); their
choices live in the `*.settings.json` files. The About / Work / Contact sections are still placeholders.

## Stack

- Next.js 16 (App Router, Turbopack, `cacheComponents`), React 19, TypeScript, Tailwind CSS v4.
- Colours live as CSS variables in `src/app/globals.css` (`--paper`, `--ink`, `--muted`), exposed to Tailwind.
- pnpm (`pnpm-lock.yaml`; `pnpm-workspace.yaml` skips unrs-resolver's build script). Static by default. Vercel builds
  with Node 22 (`engines`) and `next build` (`vercel.json`); the dashboard
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
- **All glow settings live in `src/components/glow.settings.json`**, typed by `GlowSettings` in `glow.ts`. The owner
  tuned and approved these values (2026-10-13) in a temporary studio that has since been removed; change them only
  when asked.
- Placement: a box `reach` (vmin, capped at `maxReach` px) square in the top-right corner, clipping a radial square
  twice that size centred on the corner, faded by a radial mask. `attach: "fixed"` keeps it in the corner while
  scrolling; `"page"` lets it scroll away (the box clips, so it never widens the page). Keep it a corner accent,
  not a full-page background.
- **`background`** (default React Bits' near-black `#120f17`) is the dark-mode page colour; light mode is always
  white. `colors` are only the glow's own colours. `glowPalette()` puts the background in front **twice** (a radial
  Grainient is still mid-ramp at its canvas edge; without the repeated stop the glow ends in a ring) and
  pre-compensates it for `contrast`/`saturation`, which Grainient's shader also applies to those stops. Without that,
  contrast 1.39 left a faint dark ring. Light mode uses `lightColors` over white for the glow; the grain layer uses Grainient's own `lightMode` (background stops become white).
- **Grain over the whole site** comes from Grainient itself: a second, full-viewport instance behind the glow with a
  flat background palette, no motion, intro or interaction. It draws once and idles (measured: 0 draws while idle;
  the library still redraws it once per pointer move because it listens on `window`). Its grain is luma-weighted
  like React Bits': strongest in the glow's mid-tones, subtle on the flat page.
- Motion, hover, grain and reach values are the owner's approved settings; don't override them in code.
- `lightColors` are the glow's colours in light mode, shown exactly as written (contrast and saturation are
  compensated like the background). Grainient's own lightMode only lightened and reversed the dark colours, which
  read as dusty grey-blue. Light falloff measured monotonic to white: 206 → 228 → 239 → 247 → 252 → 255.
- `lightGrain` (0.5, owner's request 2026-10-14) scales the grain in light mode only: grain can only darken a white
  page, so at full strength it read slightly grey (mean 254.0, specks to 248). At 0.5: mean 254.5, specks to 252.
- Context loss (GPU reset, sleep and wake): Grainient does not restore its context, so CornerGlow remounts it on a
  fresh canvas (at most 3 times, 1s apart).
- Decoration only: `aria-hidden`, `pointer-events-none` (Grainient tracks the pointer on `window`, so hover still
  works), loaded with `next/dynamic` (`ssr: false`), content above it (`relative z-10`). Reduced motion freezes it
  and turns off the intro and the hover.
- Verify by measuring, not by eye (1440×900, corner crop):
  - falloff along the diagonal descends monotonically to the exact page background with no dip or step (dark = `background`; light 255,255,255);
  - a brisk mouse sweep over the glow changes it visibly (max ≥ 15 levels), a sweep elsewhere doesn't, and reduced motion gives 0;
  - forcing `WEBGL_lose_context` makes it disappear cleanly and come back by itself within ~4s.

## Navigation (live on the site)

`src/components/site-nav/` is the nav the site uses: `SiteNav` renders `FloatingNav` from `nav.settings.json`, in the
`(site)` route group layout, so it stays mounted across pages. It renders client-only (`LazySiteNav`, `ssr: false`):
its look depends on the screen, and a server render showed the desktop bar first and jumped on phones (CLS 0.236,
TBT 570ms, Performance 71; client-only: CLS 0, TBT 20ms, 99). Pages wrap their `<main data-page>` in
`PageTransition`. The site bundles only Hugeicons (`site-nav/icons.tsx`); if the saved library changes, swap it there.
The site is one scrolling page: `SiteNav` runs `FloatingNav` with `sections`, so page items are in-page links
(plain `<a href="/#about">`: Next's `<Link>` rendered "/#about" as "/about" on the server in 16.4) to
`<section id data-section>` elements, and a scrollspy marks the section crossing 35% of the screen. With scroll
`"reveal"` and `revealAfter="hero"` the nav is hidden while the first section is current and shows past it.

## Home

`src/components/home/`: `HomePage` renders the hero (`heroes.tsx`, the "inline" idea: the statement first, with the
portrait set inside the sentence as a pill that widens on hover), then the About / Work / Contact sections
(placeholders for now). Its look (tone, entrances, pace, badge, buttons) is in `home.settings.json`. Entrances are CSS
(`home.css`), so they start with the first paint and cost no JavaScript. The portrait is `src/assets/mostafa-osama.jpg`
(static import: next/image sizes, AVIF/WebP, blur placeholder).

## Navigation settings

The nav's setup (desktop and mobile, breakpoint, items, Hugeicons, layout, motion, page transition) is in
`src/components/nav.settings.json`, read through `navConfig` in `src/components/nav.ts`; `FloatingNav` supports more
options than the saved ones. If the icon library ever changes, swap the imports in `site-nav/icons.tsx`.

The nav fits itself to every screen (`src/components/site-nav/fit.ts`): it keeps the saved setup when it fits, else
drops inline names, else shrinks items (down to 36px), else moves links and then pages (from the end) into a
"More" menu. The site nav's glass blurs 20px (owner's request, 2026-10-14). Its `view-transition-name` is set only
under `:root:active-view-transition` (nav.css): a named element is a backdrop root, so a permanent name made the glass
blur nothing and content showed through sharp. Glass uses only the standard
`backdrop-filter` (the CSS build adds the Safari prefix; writing both made it drop the standard one). Panels cap their height to
the screen and scroll inside; side rails publish `--nav-inset-left/right` so content stays clear of them.

Theme and motion preferences live in `src/components/preferences.ts`: `data-theme` / `data-motion` on `<html>`,
remembered in localStorage. `globals.css` and CornerGlow follow `data-theme` (CornerGlow reads it through
`usePreferences`). An inline script in `RootDocument` restores them before first paint.

## Languages, fonts, buttons

- **English at `/` (`app/(en)`), Arabic at `/ar` (`app/ar`, `dir="rtl"`).** Each language has its own root layout
  sharing `SiteShell`; unknown URLs get
  `app/global-not-found.tsx` (`experimental.globalNotFound`). `/en` redirects to `/`. All strings live in
  `src/i18n/dictionaries.ts`; the nav reads them through `I18nProvider`. Use logical CSS (start/end, `ps`/`pe`,
  `text-end`) so layouts mirror; `:lang(ar)` resets letter-spacing (it breaks Arabic joining).
- **Font: Alexandria** (approved 2026-10-14), in `src/fonts/alexandria/latin.ts` + `arabic.ts`; `site-latin.ts` /
  `site-arabic.ts` point at it. The Arabic face holds Arabic letters only (Latin words fall through to the Latin
  face) and is not preloaded: Next preloads fonts for every page regardless of layout, so preloading it made English
  download ~100 KB it never uses.
- **Buttons:** `src/components/ui/Button.tsx` + `buttons.css`, configured by `buttons.settings.json`. Hover modelled
  on dennissnellenberg.com's buttons (owner's request, 2026-10-14; their code: `initMagneticButtons` in
  `/assets/js/index-new.js`). **Magnetic:** only while the cursor is on the button, it follows `(pos/size − 0.5) × 2 ×
  strength` px, the label `follow` times further; each move re-targets a `followTime` ease-out (their power4.out over
  1.5 s), so it trails. On leave it springs back over `releaseTime` along the `spring` curve (damped-spring or GSAP
  elastic.out sampled into CSS `linear()`). **Fill** (`fill: "rise"`, main and secondary buttons): a `.btn-fill` oval
  150% × 200% parked above; on enter it drops below and slides up over `fillTime` (power2.inOut), on leave it exits
  through the top; text turns in half the fill time. One delegated listener (`ButtonEffects`, WAAPI for the fill, CSS
  variables for the pull); mouse only; reduced motion: no pull, instant fill. Speeds reach CSS as `--fill-time`,
  `--follow-time`, `--release-time` on each button. From the click until ready again, a stateful button is locked
  (`aria-disabled`, owner's request): no hover, fill, pull or press, clicks ignored, the not-allowed cursor; a pulled
  button eases home without the wobble, and a raised fill fades in place (only the busy main button keeps its fill).
  Done and failed also turn one flat colour (`--success` green /
  `--danger` red), no fill, pull, press or hover change, `aria-disabled`, clicks ignored, the not-allowed cursor; the
  label says what happened ("Downloaded" / "Download failed") and it returns to ready after 2.6 s / 3.2 s.
- **Stateful buttons** (`StatusButtons.tsx`), each a full cycle (`cycle`), click → working → done (or failed), its own
  story in buttons.css ("Cycles"), on custom SVG icons whose parts rest in their final pose (reduced motion just shows
  them): `EmailButton` (mailto link that also copies the address, since a mailto can't report success: the flap lifts,
  seals with a wax-seal dot, the envelope leaves; 1 s, then "Address copied"), `DownloadButton` (the CV: the arrow
  dives into the tray, then the progress shows as the saved `progress` style, "outline" by default (owner's choice):
  a primary line traces the button's edge and gives way to the done border; set both `rx` and `ry`, or a pill's
  outline turns into an ellipse. The shown progress is driven per frame (`follow`): it starts after the dive
  (`DIVE_MS`), then takes the smaller of an ease-in-out timeline over `TRACE_MS` (1.6 s) and a smooth chase of the real
  bytes, so even an instant download traces calmly and "Downloaded" waits for it. No percentage (owner's choice):
  "Downloading" with an ellipsis whose dots light in turn;
  a plain download link without JavaScript) and `SendButton` (the future contact form; the form owns the request and
  passes `status`: the plane winds back and takes off, then the `sending` indicator). Shared: labels roll (out up with
  a blur, in from below; back to ready rolls the other way), done pops (scale 1 → 1.06 → 0.985 → 1), draws its check and rings
  out one success pulse,
  failed shakes; a raised fill leaves through the top when the button locks (the busy main button's at done, uncovering the
  green), animated by ButtonEffects from a MutationObserver on `aria-disabled` / `data-status`. All labels share one grid cell, so the width
  never changes; a live region announces each change. RTL mirrors the plane and the envelope's exit (`--dir`).
- **Colour tokens** in globals.css, one value per theme, contrast measured: the primary (`--primary` / `--on-primary`),
  one of five palettes picked by `data-primary` on `<html>` (set from `buttons.settings.json` `primary` in
  RootDocument; teal is the default: light #127686, dark #49d2ea). Every palette measured: light 5.2–5.7:1 with white;
  dark 10.2–10.7:1 on the page and 9.3–9.7:1 with its `--on-primary`, except cobalt (owner's choice, 2026-10-14): dark #2981fb, the light shade's hue at full strength, 5.1:1 on the page and 4.9:1 with #041531 (white text on it would be 3.7:1). Errors
  (`--danger` / `--on-danger`; light #c4281c 5.7:1, dark #ff8a80 8.3:1 on the page) and success (`--success` / `--on-success`; light #137738 5.6:1 with white, dark #56d57b 10.1:1 on the page, 9.5:1 with #021c09). Re-check contrast if you change
  them.
- (When measuring frame rates with Playwright, bring the page to the front: a background tab runs at ~2 fps.)
- **Measured (mobile, production build, 2026-10-14):** `/` 93–94 / 100 / 100 / 100 with one font file preloaded;
  `/ar` 85 / 100 / 100 / 100, FCP 2.0 s (the Arabic font is found late) and LCP 4.1 s (plus the saved blur/focus
  entrance). Below the 90 bar: options are preloading Arabic (costs English ~4 points), a lighter entrance, or
  `display: "optional"` for the Arabic face.

## Quality bar

- Respects `prefers-reduced-motion`, fully keyboard accessible, no horizontal scroll at 360px.
- Lighthouse (mobile, production build) Performance ≥ 90. Current home: 100 / 100 / 100 / 100.
- Screenshots with Playwright at 1440×900 and 390×844, light and dark, for every visual change.
- `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass with no warnings. `pnpm format` (Prettier, 120 columns).
- When restarting the production server for checks, free the port with `kill $(lsof -tiTCP:3200 -sTCP:LISTEN)`;
  `pkill -f "next start"` misses the `next-server` child and leaves an old build serving.

## Kept from before

- CV: `public/mostafa-osama-cv.pdf`, generated by `scripts/cv/build.py` (see its header).
