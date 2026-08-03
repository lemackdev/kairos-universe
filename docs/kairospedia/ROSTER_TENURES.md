# Roster Tenures

A roster tenure is the canonical membership interval between a player and a
team.

## Required fields

- Stable tenure ID and slug.
- Continuity, player, organization, team, game, and role IDs.
- Roster status.
- Captain and starter flags.
- Join, announcement, effective, and left dates.
- Date precision.
- End reason.
- Source IDs.
- Canon status.

Unknown dates remain `TBD` or `null` according to the schema. An active tenure
with an unknown start remains active because canon confirms current
membership, not because a date was inferred.

## Invariants

- A tenure cannot end before it begins.
- The same player cannot have duplicate active tenures for the same team.
- A single-captain team cannot have two active captain tenures.
- A player role must resolve to controlled vocabulary.
- Every source ID must resolve.
- Historical roster queries use the requested date.

## Current Kairos League state

Five active tenures represent the main roster. Exact join dates remain TBD.
Moss is the only captain. No transfer event is created for initial membership.

## Draft command

```powershell
npm run entity:new-roster-tenure -- --id example-tenure --source source-id
```
