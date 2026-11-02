# League of Legends Champion Icons

Square champion portraits are sourced from [Riot Games Data Dragon](https://developer.riotgames.com/docs/lol), version `16.21.1`.

- Local assets: `16.21.1/<Data Dragon image.full>`
- Website path: `/champion-icons/16.21.1/<Data Dragon image.full>`
- Manifest: `16.21.1/manifest.json` (source metadata, filenames, dimensions, SHA-256 hashes)
- Import: `node scripts/download-champion-icons.mjs` from the repository root
- Verification: `node scripts/download-champion-icons.mjs --verify`

Use the `image.full` value from the pinned Data Dragon champion manifest, not a champion's display name, to construct paths. These are reference assets, not Kairos canon. Their presence does not establish any player's favorite champions.

Riot Games owns the League of Legends artwork. Before publishing a feature that uses these assets, check the [Riot Games developer policies](https://developer.riotgames.com/policies/general), including applicable attribution and product disclaimers. Do not present Kairospedia as a Riot-endorsed product.
