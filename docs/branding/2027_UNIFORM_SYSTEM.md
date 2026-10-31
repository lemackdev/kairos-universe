# 2027 Uniform System

## Scope and Canon Status

These author-approved 2027 designs are **approved-future-canon**. This asset integration is not a new episode, launch, signing or announcement. The repository remains at Episode 75, 2026-11-24. The brief's reference to impending narrative canonization is not evidence that a later episode has occurred.

| Record | Teams | Color | Meaning |
| --- | --- | --- | --- |
| [Kairos Black](../../data/uniforms/kairos-black-2027.json) | kairos-lol-main; kairos-cs-main | Black / gold | Primary competitive identity |
| [Academy Blue](../../data/uniforms/kairos-academy-blue-2027.json) | kairos-lol-academy-blue | Blue / light-blue trim, gold crest | Advanced development |
| [Academy White](../../data/uniforms/kairos-academy-white-2027.json) | kairos-lol-academy-white | White / gold and black trim | Foundational development |
| [CS Academy Green](../../data/uniforms/kairos-cs-academy-green-2027.json) | kairos-cs-academy | Green / gold | Counter-Strike development |

Academy equipment meets the same professional standard as main-team equipment. White to Blue to Main is a conceptual development path, not an automatic promotion rule. Green is Counter-Strike Academy, not a third League academy.

All eight renders retain the same football-style design family: cut, collar, piping, Greek motifs, crest and partner positions. Backs use KAIROS and tonal column geometry, without oversized partner marks. Future player names and numbering remain unspecified.

## Data and Publication

Canonical images live once under assets/branding and assets/uniforms. Four records in data/uniforms reference ten indexed data/visual-assets records by stable ID. The existing canon validator validates both new schemas, unique IDs and indexes. The shared branding loader additionally validates references, PNG signatures, dimensions, SHA-256 hashes, preserved originals, framing and assignment consistency.

Both apps run npm run branding:build during normal preparation. It derives a publication-filtered .generated/branding.json and copies only the selected images into ignored public/branding directories. These disposable build copies are not independent canonical assets or committed duplicate binaries. Rebuilding requires the repository assets, data, index and shared directories to be available alongside the app.

The current Kairospedia publication manifest exposes the League and Counter-Strike main teams. Their shared black kit and both reusable logos are available; Blue, White and Green remain unpublished. Academy pages remain hidden. A uniform assignment does not alter a roster or result. KairosDB currently retains its League-focused competitive pages.

## Validation

Run npm run validate from website and kairosdb. This includes branding validation and their existing validation pipelines. Tests cover assignment mapping, future supplier status, publication filtering and rendering. No dependencies were added.

See [partner policy](PARTNER_PLACEMENT.md), [cleanup report](ASSET_CLEANUP_NOTES.md), [uniform index](../../index/uniforms.json) and [asset index](../../index/visual-assets.json).

