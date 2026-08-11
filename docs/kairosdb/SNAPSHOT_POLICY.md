# Snapshot Policy

## Identity

```json
{
  "snapshotId": "leaguepedia-2026-08-03",
  "source": "leaguepedia",
  "capturedDate": "2026-08-03",
  "effectiveUniversePeriod": "end-of-2026-season",
  "status": "frozen",
  "automaticUpdatesEnabled": false,
  "nextReviewPeriod": "2027-midseason",
  "changesRequireExplicitApproval": true
}
```

- **Snapshot cutoff:** `2026-08-03T23:59:59-03:00` (`2026-08-04T02:59:59Z`).
- **Kairos Universe effective period:** end of the 2026 season.
- This becomes the canonical external competitive world baseline for the end
  of the 2026 season inside the Kairos Universe.

## What "frozen" means

- The snapshot's raw responses, normalized records, indexes, and checksums
  are never modified after `build-snapshot` successfully populates and
  freezes them. `snapshot.json.status` reads `"frozen"`.
- Real-world roster changes after 2026-08-03 do not automatically alter the
  Kairos Universe or KairosDB. There is no recurring synchronization job, no
  cron, no daily/weekly/continuous roster sync.
- Any later change requires explicit user approval and is layered on top of
  the frozen snapshot via the override system, never by editing the snapshot
  itself. See [`OVERRIDE_WORKFLOW.md`](./OVERRIDE_WORKFLOW.md) and
  [`FROZEN_WORLD_RESOLUTION.md`](./FROZEN_WORLD_RESOLUTION.md).

Examples of later changes, all requiring explicit approval:

- Import a real-world midseason roster change.
- Retain the frozen roster instead.
- Create a Kairos Universe-exclusive transfer.
- Diverge from real-world history.

## If this snapshot is (re)built after the cutoff

If a snapshot build runs after `2026-08-04T02:59:59Z`, the importer does not
silently label live/current Leaguepedia data as the August 3 snapshot without
disclosure. In that situation the importer should:

1. Attempt to identify Leaguepedia page revisions at or before the cutoff.
2. Retain revision IDs and timestamps for every source page (see
   `source-pages.json` and each normalized record's `sources` field).
3. Report any pages that cannot be reconstructed reliably (this project's
   initial import ran the same day as the cutoff, so a live query legitimately
   reflected pre-cutoff state — see the task's final report for what was
   actually observed).
4. Never claim exact August 3 accuracy that wasn't actually verified.

## Next review

The next scheduled review window is **2027 midseason**. See
[`2027_MIDSEASON_UPDATE_WORKFLOW.md`](./2027_MIDSEASON_UPDATE_WORKFLOW.md) for
what that review does.
