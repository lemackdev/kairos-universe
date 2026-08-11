# Override Workflow

Overrides are the *only* mechanism allowed to change how the competitive
world resolves after the `leaguepedia-2026-08-03` snapshot is frozen. They
never edit the frozen snapshot's files.

## Where overrides live

`data/competitive-world-overrides/` — one JSON file per approved override.
This directory is empty in this release; no override has been created or
approved. The resolver reads it on every request (see
[`FROZEN_WORLD_RESOLUTION.md`](./FROZEN_WORLD_RESOLUTION.md)), so adding a
file here is sufficient for it to take effect — no code change is required
to apply a new override, only to introduce a genuinely new *kind* of
override behavior.

## Shape

```ts
interface CompetitiveWorldOverride {
  id: string;
  kind: OverrideKind; // see FROZEN_WORLD_RESOLUTION.md
  effectiveDate: string; // ISO date; only applied on/after this date
  approvedBy: string;
  approvedAt: string;
  description: string;
  playerId?: string;
  teamId?: string;
}
```

## Process to create one

1. Identify the change (a real-world transfer to adopt or reject, a
   Kairos-exclusive divergence, a retirement, etc.).
2. Get explicit user approval for that specific change — never inferred,
   never automatic, never bundled into a routine sync.
3. Write the override JSON file to
   `data/competitive-world-overrides/<override-id>.json`.
4. Rebuild KairosDB's catalog (`npm run catalog:build` inside `kairosdb/`) so
   pages reflect the new resolved world at request time.
5. The frozen snapshot's own files under
   `external-data/leaguepedia/snapshots/leaguepedia-2026-08-03/` are never
   touched by this process.

## What this release does NOT do

No override was created as part of building this system. The mechanism is
built and testable (empty-directory case), but exercising it with a real
override is a separate, explicitly authorized future task — see
[`2027_MIDSEASON_UPDATE_WORKFLOW.md`](./2027_MIDSEASON_UPDATE_WORKFLOW.md).
