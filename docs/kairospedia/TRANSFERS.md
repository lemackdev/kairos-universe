# Transfers

Transfer events preserve movement without erasing either team history or match
lineups.

Supported event types include permanent transfer, free-agent signing, release,
loan, loan return, promotion, demotion, benching, activation, retirement, role
transition, and staff appointment.

## Example workflow: a Kairos player joins another organization

This is process documentation only. It does not describe an actual transfer.

1. Create or validate the destination organization.
2. Create or validate the destination game-specific team.
3. Close the Kairos roster tenure with the confirmed effective date and end
   reason.
4. Create the transfer event with source IDs and only confirmed dates, status,
   and fee information.
5. Create the destination roster tenure.
6. Update current-roster references without deleting historical membership.
7. Preserve all historical match lineups exactly as recorded.
8. Add new files to the correct path-only indexes.
9. Add or update source-registry records.
10. Run repository validation and `npm run validate` in `website/`.
11. Enable the destination organization, team, and player route through the
    publication manifest only when the content is ready.

## Rules

- A transfer fee remains unknown unless canon confirms it.
- Announcement and effective dates are distinct.
- A rumor cannot default to confirmed.
- A player is not removed from historical Kairos records.
- A current-team change cannot rewrite an old match lineup.
- A loan creates a bounded tenure, not a permanent transfer by implication.

## Draft command

```powershell
npm run entity:new-transfer -- --id example-transfer --source source-id
```
