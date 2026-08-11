# Deployment

No deployment has occurred for KairosDB. This document describes how it is
expected to be deployed when that is explicitly requested.

## Independent app

`kairosdb/` is a standalone Next.js 16 App Router application with its own
`package.json`, build (`npm run build`), and no runtime dependency on
`website/`. It can be deployed anywhere a Next.js app can — a Vercel-style
platform, a Node server, or a static export of the fully static routes (most
routes are static/SSG; `/search` is server-rendered on demand for its
initial `?q=` param handling, though the search itself runs client-side over
a prebuilt index).

## Build-time data dependency

Before `next build` (or `next dev`), the app requires `npm run catalog:prepare`
(chained automatically by both `dev` and `build`), which:

1. Reads Kairos canon data directly from `../data` (the repository root)
   relative to `kairosdb/`.
2. Reads the frozen external snapshot from
   `../external-data/leaguepedia/snapshots/leaguepedia-2026-08-03/` if it
   exists (builds successfully with zero external records if it doesn't yet
   — see [`SNAPSHOT_POLICY.md`](./SNAPSHOT_POLICY.md)).
3. Writes `.generated/catalog.json` and `.generated/search-index.json`.

This means a KairosDB deployment needs read access to the sibling
repository root at build time — either by deploying from a checkout of the
full monorepo-adjacent structure (`website/`, `kairosdb/`,
`external-data/`, `data/`, etc. all present), or by vendoring
`.generated/*.json` as a pre-built artifact if the deploy target only
receives `kairosdb/`.

## Cross-linking between deployments

`kairosdb/src/lib/links.ts` and `website/src/lib/links.ts` both default to
same-origin relative paths (`/players/<slug>`, `/wiki/players/<slug>`) and
are overridable via `NEXT_PUBLIC_KAIROSDB_BASE_URL` /
`NEXT_PUBLIC_KAIROSPEDIA_BASE_URL`. If the two apps end up on separate
domains or subdomains rather than reverse-proxied under one origin
(`/wiki/*` → Kairospedia, everything else → KairosDB, for example), set these
env vars at build time to the other app's public origin.

## Not done as part of this task

No deploy was performed, and none should be inferred from this document —
deployment requires an explicit, separate request.
