# Legacy content export (portfolio-2023)

Source material for the 2026 rebuild. This directory exists on the `legacy` branch only.

## data/

`projects.json` (5 records) and `skills.json` (6 records), from the 2023 MongoDB collections.

The Atlas cluster (`portfoliocluster.zrejcdz.mongodb.net`) no longer resolves (NXDOMAIN), so
these were recovered on 2026-10-08 from the still-live 2023 Vercel deployment, whose route
handlers were rendered statically at build time:

- `GET https://mostafa-osama-official.vercel.app/api/projects/get-all`
- `GET https://mostafa-osama-official.vercel.app/api/skills`

Shape is the Prisma model (`id`, `v`), not raw Mongo (`_id`, `__v`). `get-top` was not saved
separately; it equals `projects.json` filtered by `isTop`.

Repo links point at `github.com/MostafaOS21/...`. That account was renamed to
`TheMostafaOsamaDev`; GitHub redirects the old URLs for now.

## images/

Every image URL referenced by those records (22 project screenshots, 6 skill icons, all
`i.ibb.co`), downloaded 2026-10-08. `manifest.json` maps each source URL to its local file.
No record referenced imagevenue (it only appeared in `next.config.js`).
