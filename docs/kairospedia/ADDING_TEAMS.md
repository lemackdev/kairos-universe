# Adding Teams

## Required workflow

1. Verify the parent organization record exists.
2. Verify the game and division vocabulary already exists or is canonically
   justified.
3. Confirm no equivalent team exists under another slug.
4. Create the team record under `data/teams/`.
5. Keep intended competition distinct from confirmed participation.
6. Add the path to `index/teams.json`.
7. Create roster and staff tenures only for confirmed assignments.
8. Validate captaincy, active-tenure, and source rules.
9. Update organization and division documentation.
10. Run `npm run validate` from `website/`.
11. Enable the team in the publication manifest only after every public
    reference is ready.

## Draft command

```powershell
npm run entity:new-team -- --id example-team --source source-id
```

An organization and its team must never share one entity record.
