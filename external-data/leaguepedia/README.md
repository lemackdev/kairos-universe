# Leaguepedia External Data

This directory holds imported, structured, external-reference data pulled from
[Leaguepedia / League of Legends Esports Wiki](https://lol.fandom.com/) via
its MediaWiki and Cargo APIs. It exists to feed **KairosDB**
(`kairosdb/`), the competitive career and results database. It is not part of
Kairospedia's narrative canon.

See [`docs/kairosdb/DATA_SOURCES_AND_ATTRIBUTION.md`](../../docs/kairosdb/DATA_SOURCES_AND_ATTRIBUTION.md)
for the full attribution and licensing statement, and
[`docs/kairosdb/SNAPSHOT_POLICY.md`](../../docs/kairosdb/SNAPSHOT_POLICY.md)
for the freeze/review policy.

## Layout

```
leaguepedia/
  import-policy.json          inclusion/exclusion rules for the importer
  snapshots/
    leaguepedia-2026-08-03/   one immutable snapshot per capture
      snapshot.json           snapshot identity + policy (see below)
      manifest.json           every Cargo/MediaWiki query issued, in order
      source-pages.json       every source page touched, with revision info
      raw/                    raw API responses, unmodified, before normalization
        cargo/
        mediawiki/
      normalized/             normalized entity records, one JSON file per record
        organizations/
        teams/
        players/
        staff/
        roster-tenures/
        staff-tenures/
        aliases/
      indexes/                flat indexes over the normalized records
      reports/                human-readable import reports (summary, warnings,
                               ambiguous records, duplicate candidates, missing
                               fields, source-revision coverage, roster validation)
      checksums.json          checksum of every raw and normalized file
```

## Snapshot identity

- **Snapshot ID:** `leaguepedia-2026-08-03`
- **Source:** `leaguepedia`
- **Captured date:** `2026-08-03`
- **Snapshot cutoff:** `2026-08-03T23:59:59-03:00` (`2026-08-04T02:59:59Z`)
- **Kairos Universe effective period:** `end-of-2026-season`
- **Status:** `frozen`
- **Automatic updates:** disabled
- **Next review window:** `2027-midseason`

Once a snapshot's `status` is `frozen`, the build pipeline refuses to
overwrite its `raw/`, `normalized/`, `indexes/`, or `checksums.json` unless
called with an explicit destructive flag. That flag is intentionally not
documented in normal usage instructions — see
[`docs/kairosdb/LEAGUEPEDIA_IMPORTER.md`](../../docs/kairosdb/LEAGUEPEDIA_IMPORTER.md).

## Review statuses

Every normalized record carries a `reviewStatus` of `imported`,
`validated`, `needs-review`, `approved`, or `rejected`. Only the snapshot
approval process (`leaguepedia:build-snapshot`, run against all automated
validation checks) may promote a record to `approved`. See
[`docs/kairosdb/REVIEW_AND_APPROVAL.md`](../../docs/kairosdb/REVIEW_AND_APPROVAL.md).

## What is not here

- No images, logos, flags, or player photographs.
- No long-form biography or news-article prose.
- No match history beyond what is needed to establish current roster
  membership for this release.
- No Kairos Universe fictional entities — those live in `data/` and are
  never imported from Leaguepedia.
