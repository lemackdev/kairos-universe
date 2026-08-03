# Adding Players

## Required workflow

1. Search all people, player, coach, alias, and retcon records for duplicates.
2. Reuse an existing person identity when the same person changes function.
3. Register the supporting source.
4. Create the player record under `data/players/`.
5. Preserve legal name, display name, nickname, historical aliases, and
   retconned aliases as distinct fields.
6. Do not infer nationality, residence, birth date, prior team, contract, or
   biography.
7. Add the path to `index/players.json`.
8. Create a roster tenure if team membership is confirmed.
9. Validate role, captaincy, team, source, and date references.
10. Update readable canon documents where necessary.
11. Enable the player in the publication manifest only with a published team.

## Draft command

```powershell
npm run entity:new-player -- --id example-player --source source-id
```

Player age is calculated from date of birth and the relevant narrative or
event date. Never store an age as a substitute for an unknown birth date.
