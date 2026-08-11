# Data Sources and Attribution

## Source

Structured external competitive data in KairosDB — team names, organization
names, player IDs, legal/full names, roles, countries, residencies, dates of
birth (when available), active/substitute/trainee status, staff roles, and
roster tenure dates — is adapted from **Leaguepedia / League of Legends
Esports Wiki** (<https://lol.fandom.com/>) via its MediaWiki and Cargo APIs
(`https://lol.fandom.com/api.php`).

## Provenance is preserved, not discarded

Every imported entity retains:

- Source site (`leaguepedia`)
- Source page title
- Source URL (derivable from the page title)
- Page ID (when available)
- Revision ID
- Revision timestamp
- Retrieval timestamp
- Snapshot ID (`leaguepedia-2026-08-03`)
- Importer version
- Raw-record checksum

See `ProvenanceFields` and `SourceRecord` in
`kairosdb/scripts/leaguepedia/types.ts`, and
[`EXTERNAL_DATA_MODEL.md`](./EXTERNAL_DATA_MODEL.md).

## License

Leaguepedia page content is generally published under **CC BY-SA 3.0**
unless a specific page states otherwise. Every `SourceRecord` carries
`license: "CC-BY-SA-3.0"`. KairosDB's `/sources` page and every external
team/player page link back to this attribution.

## What is explicitly excluded

- **No images.** Player photographs, team logos, tournament art, flags, and
  other media are never downloaded automatically. Where an image filename is
  useful as an upstream reference, only the filename is stored — never the
  binary. Any future image use requires separate license review.
- **No long-form prose.** Full player biographies, news articles, and trivia
  paragraphs are never imported. Only structured facts (see
  [`EXTERNAL_DATA_MODEL.md`](./EXTERNAL_DATA_MODEL.md)) are captured.
- **No match history or statistics** in this release — see
  [`KAIROSDB_OVERVIEW.md`](./KAIROSDB_OVERVIEW.md) for current scope.

## Fiction vs. reality

Kairos Universe fictional events, players, teams, and matches are **not**
real-world people, organizations, or events. No official Kairos match has
occurred. KairosDB's global notice banner and every external-record page
carry an explicit "real-world reference snapshot" badge so the two origins
are never visually ambiguous. See
[`PRODUCT_SEPARATION.md`](./PRODUCT_SEPARATION.md).

## The August 3 snapshot is intentionally frozen

The `leaguepedia-2026-08-03` snapshot is a deliberate, permanent point-in-time
capture, not a live mirror. See [`SNAPSHOT_POLICY.md`](./SNAPSHOT_POLICY.md)
for the freeze policy and the 2027 midseason review window.
