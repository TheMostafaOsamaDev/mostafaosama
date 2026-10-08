# mostafaosama

Personal site of Mostafa Osama. Next.js 16, Tailwind v4, GSAP, MDX. Fully static.
Design and content rules live in [CLAUDE.md](./CLAUDE.md); read it before changing anything visual.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build, must pass with no warnings
npm run lint
npm run format
```

## Everyday changes

- **Jobs, projects, dates, numbers:** `src/content/career.ts` and `src/content/projects.ts`. Every number must be checkable; the comments say where each one came from.
- **A post:** add `src/content/writing/<slug>.mdx` with `export const metadata = { title, description, date, draft }`. Drafts show in `npm run dev` only. The Writing section appears on the home page once one post is published.
- **An experiment:** copy one of the folders in `src/lab/`, then register it in `src/content/lab.ts`, `src/lab/Loader.tsx` and `src/lab/previews.tsx`.
- **The CV:** edit the content in `scripts/cv/build.py`, render it to PDF (the script's header explains how), and replace `public/mostafa-osama-cv.pdf`.
- **The portrait:** `node scripts/portrait/build.mjs path/to/photo.jpg`, then commit the two masks it writes to `public/`. Never commit the photo itself.

## Deploying

Vercel builds `main` for production and every other branch as a preview. `NEXT_PUBLIC_SITE_URL` sets the canonical URL (default: the vercel.app domain).
