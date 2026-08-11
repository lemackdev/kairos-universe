# Review and Approval

The importer never marks imported data as trusted by default. Every
normalized record carries a `reviewStatus`:

```
imported → validated → approved
              ↓
         needs-review
              ↓
          rejected
```

- **`imported`** — set by `leaguepedia:normalize`. The record parsed and was
  structurally buildable, nothing more.
- **`validated`** — set by `leaguepedia:validate` (automated). Promoted from
  `imported` only if it passes structural checks: unique stable ID, unique
  slug within its kind, valid references (team → organization, roster tenure
  → player/team, staff tenure → staff/team), and a non-empty `sources` array.
- **`approved`** — set only by the snapshot approval process
  (`leaguepedia:build-snapshot`'s final stage), and only for records that are
  already `validated` and were never flagged `needs-review` at any earlier
  stage.
- **`needs-review`** — anything that fails a check, or that the normalizer
  flags proactively (see below). Automated validation can move a record
  *into* `needs-review` (e.g. missing source reference) but never *out* of
  it — only a human, editing the record directly, does that.
- **`rejected`** — reserved for records a human determines are genuinely
  invalid; not set automatically by this pipeline.

## Automatic approval criteria

Per the task that introduced this importer, the complete initial import may
be approved automatically only when, for a given record:

- Source revision is recorded.
- A unique source identity resolved (namespaced stable ID, no ambiguity).
- Its team exists as a normalized record.
- The roster tenure is current (`Ten.IsCurrent="1"` at query time).
- The role parsed successfully, or is explicitly `"unknown"` (never forced).
- No collision with a fictional Kairos entity.
- No duplicate source page.
- No contradictory current-team result (the same person page resolving to
  more than one current team).

All other records stay `needs-review`.

## What proactively triggers `needs-review`

`normalize.ts` sets `needs-review` directly (bypassing `imported`) for:

- A player/staff nickname colliding with a fictional Kairos player's
  nickname.
- A person page with current tenures on more than one team simultaneously.
- Any record sourced from the `ListplayerCurrent` fallback table instead of
  the modern Tenures system (less complete data, flagged so it's easy to
  find and manually verify).

## Where this surfaces

- `reports/IMPORT_WARNINGS.md` and `reports/AMBIGUOUS_RECORDS.md` /
  `DUPLICATE_CANDIDATES.md` list every record needing review, with the reason.
- KairosDB pages show a visible warning badge (`ReviewBadge`,
  `kairosdb/src/components/Badge.tsx`) on any record whose `reviewStatus`
  isn't `approved` — published, but never silently presented as fully
  trusted.
- `npm run leaguepedia:review-report` regenerates the summary and warnings
  reports on demand.
