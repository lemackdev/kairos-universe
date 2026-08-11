# Product Separation

Kairospedia and KairosDB are two separate products sharing one repository and
one canonical data source of truth (`data/`, `index/`, `schemas/` at the
repository root).

| | Kairospedia (`website/`) | KairosDB (`kairosdb/`) |
|---|---|---|
| Purpose | Narrative canon encyclopedia | Competitive career and results database |
| Covers | Episodes, characters, relationships, organizations, locations, landmarks, world state, historical context | Players, teams, organizations, rosters, staff, roster histories, transfers, competitions, matches, results, statistics, career histories |
| Data origin | Kairos Universe canon only | Kairos Universe canon (5 League players + team) **and** a frozen external Leaguepedia snapshot |
| App | Independent Next.js app, own `package.json`, routes, catalogs, validation, README | Independent Next.js app, own `package.json`, routes, catalogs, validation, README |
| Visual identity | Warm, serif, encyclopedia styling | Dark, dense, mono-accented, database styling |

## What never happens

- Kairospedia is never converted into KairosDB, and vice versa.
- The existing `website/` application is never replaced.
- The repository is not restructured into a monorepo tool (no shared build
  system, no workspace-level `package.json`) — `website/` and `kairosdb/`
  each remain a self-contained Next.js project with their own dependencies.
- External Leaguepedia data is never imported directly into
  `data/players/*.json` or `data/teams/*.json` — it lives entirely under
  `external-data/leaguepedia/` and is normalized into KairosDB's own
  generated catalog. It never touches Kairospedia's canon files.
- Counter-Strike content is not exposed in KairosDB during this
  League-of-Legends-only phase.

## Cross-linking

The two products link to each other without merging navigation or page
purpose:

- Kairospedia player/team pages for the five published Kairos League players
  and the Kairos League team show a **"Competitive profile on KairosDB"**
  link (`website/src/lib/links.ts`).
- KairosDB player/team pages for those same Kairos entities show a
  **"Read canonical narrative profile on Kairospedia"** link
  (`kairosdb/src/lib/links.ts`).
- External (Leaguepedia-sourced) players and teams do not get Kairospedia
  pages — Kairospedia is not flooded with empty external-player stubs. They
  only gain a Kairospedia page if they later become narratively relevant,
  which is a separate, explicit authoring decision.

Both link helpers default to same-origin relative paths and are
env-overridable (`NEXT_PUBLIC_KAIROSDB_BASE_URL`,
`NEXT_PUBLIC_KAIROSPEDIA_BASE_URL`) since the two apps have no decided joint
deployment yet — see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## Identity collisions

KairosDB's catalog build step (`kairosdb/scripts/build-catalog.ts`) hard-fails
if any external record's slug or ID collides with a Kairos original player or
team. The Leaguepedia importer itself also checks nicknames against Kairos
canon during normalization and flags collisions `needs-review` rather than
silently merging or overwriting. See
[`REVIEW_AND_APPROVAL.md`](./REVIEW_AND_APPROVAL.md).
