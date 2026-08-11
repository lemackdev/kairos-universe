# KairosDB Overview

KairosDB is the competitive career and results database for the Kairos
Universe. It is a separate product from Kairospedia (`website/`), which
remains the narrative canon encyclopedia.

Subtitle: **Competitive careers and results from the Kairos Universe**

## What KairosDB covers

- Players
- Teams
- Organizations
- Active rosters
- Substitutes and trainees
- Coaching staff
- Roster histories
- Transfers
- Competitions
- Matches
- Results
- Statistics
- Career histories

## What KairosDB is built from

KairosDB combines two distinct data origins, always kept visibly separate:

1. **Kairos Universe original** — the fictional players and team of the
   Kairos League of Legends story, read directly from the canonical
   repository (`data/players/*.json`, `data/teams/kairos-league-of-legends.json`).
   KairosDB never imports these from any external source and never
   duplicates them.
2. **Real-world reference snapshot** — a frozen, structured import of the
   League of Legends competitive ecosystem from Leaguepedia, captured
   2026-08-03 and frozen through the 2027 midseason review window. See
   [`SNAPSHOT_POLICY.md`](./SNAPSHOT_POLICY.md).

See [`PRODUCT_SEPARATION.md`](./PRODUCT_SEPARATION.md) for how KairosDB and
Kairospedia stay independent, and
[`EXTERNAL_DATA_MODEL.md`](./EXTERNAL_DATA_MODEL.md) for the record shapes.

## Application

- `kairosdb/` — an independent Next.js App Router + TypeScript application,
  with its own `package.json`, routes, generated catalogs, validation
  scripts, and README. It does not share a runtime with `website/`.
- Dark, dense, information-first visual identity — deliberately distinct from
  Kairospedia's warm encyclopedia styling. See `kairosdb/src/app/globals.css`.
- A global notice banner appears on every page:

  > KairosDB combines a frozen real-world-reference roster snapshot with
  > fictional Kairos Universe competitive history. Fictional events are not
  > real-world results.

## Current release scope

This release establishes the KairosDB architecture, the Leaguepedia importer,
and current-roster coverage (players, substitutes, trainees, coaching staff,
teams, organizations) for the frozen `leaguepedia-2026-08-03` snapshot.
Transfers, competitions, matches, results, and full career-history import are
intentionally out of scope for this release and show an honest empty state —
see [`LEAGUEPEDIA_IMPORTER.md`](./LEAGUEPEDIA_IMPORTER.md) and
[`2027_MIDSEASON_UPDATE_WORKFLOW.md`](./2027_MIDSEASON_UPDATE_WORKFLOW.md) for
what a future expansion looks like.
