# Leaguepedia Importer

The importer lives at `kairosdb/scripts/leaguepedia/` and talks to
`https://lol.fandom.com/api.php` (MediaWiki + Cargo APIs).

## Client behavior (`http.ts`, `cargo.ts`, `mediawiki.ts`)

- Bounded concurrency (max 2 in-flight requests) and a minimum 800ms gap
  between requests (`config.ts`).
- Every request has a 20s timeout and a descriptive User-Agent:
  `KairosDBImporter/1.0 (lemackdev/kairos-universe; Leaguepedia snapshot research)`.
- Exponential backoff retry (base 2s, capped at 60s + jitter) on network
  errors, HTTP 5xx/429, and the MediaWiki/Cargo `ratelimited`/`maxlag` error
  codes — capped at 6 attempts. It gives up and reports failure rather than
  retrying forever.
- Cargo queries paginate automatically (500 rows/page, continuing until a
  page returns fewer rows than requested) with a required, explicit
  `order_by` for deterministic ordering.
- Every raw API response is cached to disk under a name derived from the
  query and page offset, so re-running an import step that already
  succeeded is a local cache read, not a new network call — this is what
  makes `leaguepedia:resume` free to re-run.
- MediaWiki page-revision lookups are batched (50 titles/request) instead of
  one request per page.

## Query design: global joins, not per-team/per-player requests

Rather than one Cargo query per team or per player, the importer issues a
small number of **global, joined** queries and groups the results in memory:

- `queryCurrentTenuresGlobal` — one paginated query across
  `Tenures=Ten,PlayerRedirects=PR,Players=P,RosterChanges=RCJ` filtered to
  `Ten.IsCurrent="1"`, covering every current player *and* staff tenure on
  every team in a single pass (Leaguepedia's Tenures table covers both).
- `queryTeams` — one paginated query over the `Teams` table.
- `queryListplayerCurrentGlobal` — one paginated query over
  `ListplayerCurrent`, the fallback source, used only for teams that produce
  no rows from the modern Tenures-based query.

This keeps a full global sweep to roughly a few dozen Cargo pages plus a few
dozen revision-lookup batches, not thousands of one-off requests.

## Pipeline stages (`npm run leaguepedia:*`)

1. `leaguepedia:schema` — inspects live Cargo field definitions
   (`action=cargofields`) for every table the importer depends on and writes
   `reports/CARGO_SCHEMA_INSPECTION.json`, so query code can be checked
   against the live schema instead of an assumption.
2. `leaguepedia:import` (`--resume` supported) — runs the three global
   queries, resolves page revisions for every distinct team/player/staff
   page, writes raw responses and `source-pages.json`, and records every
   query in `manifest.json`. Never normalizes.
3. `leaguepedia:normalize` — re-runs the same three queries (cache hit, no
   network if `import` already ran), reads `source-pages.json`, and produces
   normalized organization/team/player/staff/roster-tenure/staff-tenure
   records with `reviewStatus: "imported"`, plus
   `AMBIGUOUS_RECORDS.md`, `DUPLICATE_CANDIDATES.md`, `MISSING_FIELDS.md`.
4. `leaguepedia:validate` — structural validation (ID/slug uniqueness,
   reference integrity, source-reference presence). Promotes
   `imported` → `validated` records that pass; demotes records missing a
   source reference to `needs-review`.
5. `leaguepedia:review-report` — tallies review-status counts and writes
   `IMPORT_SUMMARY.md` / `IMPORT_WARNINGS.md`.
6. `leaguepedia:build-snapshot` — orchestrates 1–5, then promotes
   `validated` → `approved` (the only step allowed to do so — see
   [`REVIEW_AND_APPROVAL.md`](./REVIEW_AND_APPROVAL.md)), computes
   `checksums.json` over every raw and normalized file, writes
   `snapshot.json`, and freezes the snapshot.

## Freeze and resumability

- `build-snapshot` refuses to overwrite an already-frozen `snapshot.json`
  unless called with an explicit destructive flag
  (`--force-overwrite-frozen-snapshot`). That flag is intentionally **not**
  documented in the command list above — freezing is meant to be permanent.
- If a run produces zero populated records (e.g. every query failed), the
  snapshot is written with `status: "empty"`, not `"frozen"`, and the build
  step exits non-zero. A snapshot is never silently reported as complete
  when it isn't.
- `.checkpoint.json` and the deterministic raw-cache filenames make every
  stage resumable: re-running `leaguepedia:import --resume` after a partial
  failure skips whatever already succeeded and only retries what didn't.

## Known operational risk: Cargo rate limiting

`action=cargoquery` (the endpoint every bulk team/roster/player query
depends on) is subject to a stricter anonymous rate limit than
`action=cargofields` or `action=query` in practice — a shared or busy
egress IP can see `ratelimited` errors that persist well beyond the
client's own backoff window. The importer degrades gracefully in this case
(reports the failure, does not hang, does not fabricate data) rather than
treating it as fatal. See the final report in the task that introduced this
importer for the exact rate-limit behavior observed during initial
development.
