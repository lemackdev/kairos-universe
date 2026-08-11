# Frozen World Resolution

`kairosdb/src/lib/resolver/index.ts` implements a two-layer competitive-world
resolver:

1. **Layer 1 — frozen external snapshot.** Loaded via
   `getExternalSnapshot(snapshotId)` from `kairosdb/src/lib/external/loader.ts`.
   Never mutated by the resolver.
2. **Layer 2 — approved Kairos Universe overrides.** Loaded via
   `loadApprovedOverrides()` from `data/competitive-world-overrides/` (empty
   today — see [`OVERRIDE_WORKFLOW.md`](./OVERRIDE_WORKFLOW.md)).

## Resolution order

1. Load the approved Leaguepedia snapshot (`getExternalSnapshot`).
2. Apply approved Kairos Universe overrides whose `effectiveDate` is on or
   before the requested date (`applyApprovedUniverseOverrides`).
3. Resolve the world state for a requested narrative date
   (`getCompetitiveWorldAtDate`).
4. Never modify the frozen source snapshot — every resolver function returns
   a new view, not a mutation.

## API

```ts
getExternalSnapshot(snapshotId)
getExternalTeamRoster(teamId, snapshotId)
getExternalPlayerCareer(playerId, snapshotId)
getCompetitiveWorldAtDate(date)
applyApprovedUniverseOverrides(snapshot, date)
getResolvedPlayerTeam(playerId, date)
getResolvedTeamRoster(teamId, date)
```

With zero overrides approved (the current state), `applyApprovedUniverseOverrides`
is the identity function over the frozen snapshot's teams and roster
tenures — but it still returns a distinct `ResolvedWorld` object, so no
caller can accidentally depend on override application being skipped rather
than a no-op.

## Future override kinds this is built to support

No override has been created in this release. The resolver's
`OverrideKind` type and `CompetitiveWorldOverride` shape are designed to
support, without a breaking change, all of:

- A player leaves an external team.
- An external player joins Kairos.
- A Kairos player joins an external team.
- An external team signs a fictional player.
- A real-world roster change is adopted at 2027 midseason.
- The Kairos Universe rejects a real-world roster change.
- A player retires only in the Kairos Universe.

See [`OVERRIDE_WORKFLOW.md`](./OVERRIDE_WORKFLOW.md) for how an override is
actually authored and approved when one of these is needed.
