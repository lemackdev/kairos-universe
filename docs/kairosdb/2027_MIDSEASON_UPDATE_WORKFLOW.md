# 2027 Midseason Update Workflow

This is the planned process for the next scheduled review of the frozen
`leaguepedia-2026-08-03` snapshot. None of these steps have been executed —
this document describes the workflow for when that review happens, not
something already done.

1. **Create a new candidate source snapshot.** Run the importer pipeline
   (`leaguepedia:build-snapshot -- --snapshot leaguepedia-2027-midseason` or
   equivalent) against live Leaguepedia data, producing a new, separate
   snapshot directory under `external-data/leaguepedia/snapshots/` — the
   2026-08-03 snapshot is never touched or reused as a write target.
2. **Compare it to the frozen 2026 snapshot.** Diff current tenures,
   team/organization metadata, and staff rosters between the two snapshots.
3. **Generate roster-change proposals.** One proposal per detected
   difference (player left/joined, team renamed, staff change, etc.).
4. **Classify each proposal** as one of:
   - Adopt real-world change
   - Reject real-world change
   - Replace with Kairos Universe divergence
   - Leave pending
5. **Require explicit approval** for every proposal individually — no bulk
   auto-adoption of an entire midseason diff.
6. **Create an approved override** (see
   [`OVERRIDE_WORKFLOW.md`](./OVERRIDE_WORKFLOW.md)) or a new season
   snapshot for each approved proposal, as appropriate to its scope.
7. **Preserve the 2026 snapshot permanently.** It remains the historical
   record of the end-of-2026-season competitive world regardless of what the
   2027 review approves.
8. **Rebuild KairosDB** (`catalog:build`, `search:build`) so published pages
   reflect the newly resolved world.
9. **Never rewrite historical team pages.** A team's `leaguepedia-2026-08-03`
   roster page always shows that snapshot's roster, not the current one —
   history is layered forward via overrides and new snapshots, not edited in
   place.
