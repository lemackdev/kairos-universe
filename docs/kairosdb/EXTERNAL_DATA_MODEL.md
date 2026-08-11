# External Data Model

Normalized record shapes live in
`kairosdb/scripts/leaguepedia/types.ts` (re-exported for the app via
`kairosdb/src/types/external.ts`). Every record type shares a
`ProvenanceFields` base: `sourceSnapshotId`, `importerVersion`,
`rawRecordChecksum`, `retrievedAt`, `reviewStatus`, `reviewNotes`, `sources`.

## Stable IDs

Namespaced by kind, never bare:

```
external-lol-player-<slugified-source-page>
external-lol-team-<slugified-source-page>
external-lol-org-<slugified-source-page>
external-lol-staff-<slugified-source-page>
```

Built from the Leaguepedia **source page identity**, not the display
nickname, so two players who share a nickname but have distinct source pages
(disambiguated pages) get distinct stable IDs. A user-facing KairosDB slug
may be shorter (`/players/faker`), but the internal stable ID always keeps
the `external-lol-` namespace — this is what makes a collision with a
fictional Kairos record structurally impossible, not just unlikely.
Fictional Kairos IDs never carry this prefix. See `ids.ts`.

## Organizations vs. teams

Normalized separately. A team is never assumed to be the same entity as its
organization page. When Leaguepedia's `Teams.OrganizationPage` is empty, the
team is normalized with `organizationId: null` — no parent organization is
invented.

## Roles

`RCJ.RolesIngame` values are mapped to a controlled vocabulary
(`top`/`jungle`/`mid`/`bot`/`support`) via `roles.ts`; ADC maps to `bot`.
Unrecognized or staff-shaped role strings map to `unknown` rather than being
forced into a position — the raw string is preserved alongside
(`rawRoles`). Rosters are validated, not rewritten: a team can have
substitutes, trainees, inactive members, six-player rosters, or incomplete
rosters, and the model does not assume exactly five players.

## Staff vs. players

The same real person can have both a player and a staff tenure. Because both
are resolved from the same Tenures-table row set keyed by source page
identity, a person with both `RolesIngame` and `RolesStaff` populated gets
both a `NormalizedPlayer` and a `NormalizedStaff` record, and the staff
record's `linkedPlayerId` points at the player record — they are never
silently merged into one, and never duplicated as two unrelated identities
when the link is reliable (same source page). If the identity link is ever
uncertain, the normalizer keeps separate candidate records and adds them to
`DUPLICATE_CANDIDATES.md` instead of guessing.

## Roster tenures

Current, per-team-membership records. `isCurrentAtSnapshot`,
`snapshotId`, `effectiveUniversePeriod`, and `frozenUntilPeriod` tie every
tenure back to the snapshot it belongs to. `joinedDatePrecision` is
`"unknown"` whenever a join date isn't available — dates are never invented
or inferred.

## What is deliberately not modeled yet

- Historical (non-current) tenures.
- Transfers as a distinct entity (current tenures establish membership only).
- Competitions, matches, results, statistics.

These are out of scope for this release; see
[`2027_MIDSEASON_UPDATE_WORKFLOW.md`](./2027_MIDSEASON_UPDATE_WORKFLOW.md) for
how a future expansion is expected to extend this model.
