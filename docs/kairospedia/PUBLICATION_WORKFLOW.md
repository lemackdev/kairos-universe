# Publication Workflow

Canon and publication are separate states.

An entity may be confirmed canon while remaining absent from Kairospedia.
Changing publication visibility never changes canon status.

## Publish an entity

1. Confirm the canonical record exists and passes its schema.
2. Confirm every reference resolves.
3. Confirm required tenures and sources exist.
4. Add the stable ID to the appropriate array in
   `website/kairospedia-publication.json`.
5. Run `npm run canon:prepare` in `website/`.
6. Inspect the generated route and search record.
7. Run `npm run validate`.
8. Review the rendered page on desktop and narrow viewports.

## Publication controls

The manifest has independent arrays for:

- Games.
- Organizations.
- Teams.
- Players.
- Staff.
- Competitions.
- Matches.
- Transfers.

Publishing an organization does not automatically publish all of its teams.
Publishing a team does not automatically publish every historical player or
mentor.

## Initial release guard

The validator currently requires the only enabled team to be
`kairos-lol-main`, with exactly five enabled players and no enabled
competitions, matches, or transfers.

Future expansion must deliberately revise that validation rule in the same
change that expands the manifest.

## Removal from publication

Removing an ID from the manifest removes its generated route and search record.
It does not delete or retcon the canonical entity.
