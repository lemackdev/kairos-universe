# Kairos Universe

Kairos Universe is the canonical source of truth for a fictional esports
universe centered on Kairos Esports and its parent company, Asterion
Intelligence. The repository is designed to scale to thousands of structured
records and will later support a local wiki inspired by Leaguepedia and HLTV.

Adrian Elias Vale, commonly known as Adrian Vale, is the main protagonist and
first-person narrator. He is the founder and CEO of Asterion Intelligence and
the founder and owner of Kairos Esports.

The website is intentionally not implemented in the current phase.

## Repository architecture

| Path | Purpose |
| --- | --- |
| `docs/` | Human-readable canon, organization, timeline, world-state, planning, lore, and retcon documentation |
| `data/` | Structured canonical entity records |
| `data/characters/` | First-class narrative character records |
| `data/shared/` | Reusable controlled vocabulary used across divisions |
| `schemas/` | JSON Schema Draft 2020-12 validation contracts |
| `index/` | Alphabetical path-only indexes for entity discovery |
| `assets/` | Logos, player images, team images, and tournament media |
| `archive/` | Preserved source artifacts, rendered derivatives, and checksum manifests |
| `scripts/` | Documentation and future project tooling |
| `website/` | Reserved for the future Next.js wiki |
| `wiki/` | Reserved for future generated or local wiki material |
| `kairos-version.json` | Canon and documentation-phase version metadata |

No website code or dependencies belong in the project until the website phase
is explicitly authorized.

## Source-of-truth model

- `docs/` explains canon in readable form.
- Entity files under `data/` provide structured facts for future tooling.
- Shared datasets define reusable vocabulary without duplicating entities.
- Schemas validate structure but do not establish fictional facts.
- Indexes locate entity files but do not duplicate their content.
- Assets provide media and do not override written canon.
- The archive preserves historical evidence and never overrides newer living
  canon.

Source priority:

1. Current repository canon.
2. Canon Inconsistency Audit.
3. Historical archive.

Core references:

- [Canon rules](docs/canon/CANON_RULES.md)
- [Canon glossary](docs/canon/CANON_GLOSSARY.md)
- [Documentation standards](docs/canon/DOCUMENTATION_STANDARDS.md)
- [Canon changelog](docs/canon/CHANGELOG.md)
- [Character index](docs/characters/CHARACTER_INDEX.md)
- [Adrian Vale](docs/characters/ADRIAN_VALE.md)
- [Current world state](docs/world-state/CURRENT_WORLD_STATE.md)
- [Master timeline](docs/timeline/MASTER_TIMELINE.md)
- [Retcon history](docs/retcons/RETCON_HISTORY.md)
- [Canon inconsistency audit](docs/retcons/CANON_INCONSISTENCY_AUDIT.md)
- [Historical source manifest](archive/SOURCE_MANIFEST.md)
- [League of Legends division](docs/league/LEAGUE_DIVISION.md)
- [League main roster](docs/league/MAIN_ROSTER.md)
- [League staff](docs/league/LEAGUE_STAFF.md)
- [League mentors](docs/league/LEAGUE_MENTORS.md)
- [Counter-Strike division](docs/counter-strike/COUNTER_STRIKE_DIVISION.md)
- [Counter-Strike main team](docs/counter-strike/MAIN_TEAM.md)
- [Counter-Strike academy](docs/counter-strike/ACADEMY_TEAM.md)
- [Counter-Strike staff](docs/counter-strike/COUNTER_STRIKE_STAFF.md)
- [Counter-Strike scouting philosophy](docs/counter-strike/SCOUTING_PHILOSOPHY.md)
- [Counter-Strike recruitment rules](docs/counter-strike/RECRUITMENT_RULES.md)
- [Counter-Strike player archetypes](docs/counter-strike/PLAYER_ARCHETYPES.md)
- [IGL scouting workflow](docs/counter-strike/IGL_SCOUTING.md)
- [Counter-Strike prospect pipeline](docs/counter-strike/PROSPECT_PIPELINE.md)
- [Counter-Strike relationships](docs/counter-strike/COUNTER_STRIKE_RELATIONSHIPS.md)
- [Episode documentation guide](docs/episodes/EPISODE_DOCUMENTATION.md)
- [Episode index](docs/episodes/EPISODE_INDEX.md)
- [Episode reconstruction status](docs/episodes/EPISODE_RECONSTRUCTION_STATUS.md)
- [Episode source audit](docs/episodes/EPISODE_SOURCE_AUDIT.md)
- [Episodes 30-56 source normalization](docs/episodes/SOURCE_NORMALIZATION_030_056.md)
- [Episodes 30-56 searchable source](docs/episodes/sources/KAIROS_EPISODES_030_056_NORMALIZED.md)
- [Episode continuity rules](docs/episodes/EPISODE_CONTINUITY_RULES.md)
- [Episode source gaps](docs/episodes/SOURCE_GAPS.md)
- [Future canon reservations](docs/planning/FUTURE_CANON_RESERVATIONS.md)
- [Future validation workflow](scripts/validate-project.md)

## Shared datasets

The files under `data/shared/` centralize values currently used by the project,
including games, divisions, competitions, roles, statuses, roster levels,
relationship types, locations, story periods, episode record statuses,
reconstruction statuses, confidence levels, and source types.

Every non-empty shared entry uses:

```json
{
  "id": "category-stable-id",
  "name": "Human-readable name",
  "value": "Stored record value"
}
```

Shared IDs include a category prefix to prevent collisions at scale. Add values
only when current canon or an authorized schema needs them. The achievement
type dataset remains empty because no achievement types are confirmed.

## JSON Schemas

Schemas under `schemas/` use JSON Schema Draft 2020-12. They define required
fields, allowed data shapes, current enums, and reusable definitions.

- `common.schema.json` provides shared definitions.
- Entity schemas validate characters, players, coaches and staff, teams,
  organizations, episodes, seasons, matches, and tournaments.
- Schemas are validation contracts only.
- A schema must never be treated as proof that a fictional event occurred.
- Shared enum values and schemas must be updated together.

## Global indexes

Indexes under `index/` contain only repository-relative paths to entity files.
They are sorted alphabetically and do not duplicate entity data.

Empty indexes are intentional for entity types that do not yet have records.
Every future entity file must be added to the corresponding index in the same
change.

## Versioning

[kairos-version.json](kairos-version.json) tracks:

- Canon version.
- Current story episode and story period.
- Website implementation state.
- Current documentation phase.
- Next planned phase.
- Highest episode record created.
- Highest episode confirmed as fully reconstructed, when applicable.
- Validation metadata when an authorized process records it.

The current canon version is `0.6.0`. Release notes are maintained in the
[canon changelog](docs/canon/CHANGELOG.md).

Canon versions follow semantic versioning:

- **Patch:** corrections that do not alter established canon.
- **Minor:** additive canon, documentation phases, or new structured coverage.
- **Major:** deliberate incompatible canon or data-model changes.

Do not invent a validation date. `lastValidated` remains `null` until a real
date is intentionally recorded.

## Canon status

- **Confirmed:** Established by the narrative or approved source of truth.
- **Unconfirmed:** A specific possibility that lacks canonical support.
- **TBD:** A required detail that is unknown, undecided, or unverified.
- **Retconned:** A former concept removed or replaced by current canon.
- **Non-canonical:** Material outside official continuity.

When sources conflict, do not guess or silently reconcile them. Record the
conflict as unconfirmed and resolve it through the canon and retcon process.

## Naming conventions

- Stable IDs and slugs use lowercase kebab-case.
- Shared IDs use category prefixes.
- Canonical Markdown filenames use uppercase snake case.
- Entity JSON filenames use lowercase kebab-case.
- Schema filenames use lowercase singular names ending in `.schema.json`.
- Index filenames use lowercase plural entity names.
- Folder names use lowercase kebab-case.

See [DOCUMENTATION_STANDARDS.md](docs/canon/DOCUMENTATION_STANDARDS.md) for the
complete rules.

## JSON formatting conventions

- UTF-8 without a byte-order mark.
- Two-space indentation.
- One trailing newline.
- No comments or trailing commas.
- Arrays for repeatable values.
- Empty arrays or objects for no recorded entries.
- `TBD` for required unknown scalar values.
- Stable IDs for relationships.
- No duplicated entity data inside indexes or parent records.

## Documentation workflow

1. Read the canon rules, current world state, timeline, and retcon history.
2. Verify existing IDs before creating records.
3. Add or update the canonical entity record.
4. Add only necessary shared vocabulary.
5. Update the corresponding index.
6. Update readable documentation.
7. Update world state and timeline when narrative state changes.
8. Add a retcon entry when established canon changes.
9. Update `kairos-version.json` when version or phase metadata changes.
10. Validate JSON, schemas, IDs, references, indexes, and Markdown links.

## Canonical update process

Every future episode must eventually receive a structured record in
`data/episodes/`. After each episode, the mandatory document to update is
[CURRENT_WORLD_STATE.md](docs/world-state/CURRENT_WORLD_STATE.md).

Update the [master timeline](docs/timeline/MASTER_TIMELINE.md) when an episode
adds, dates, or changes an event. Update every affected entity record and index.
If established canon is removed or replaced, update the
[retcon history](docs/retcons/RETCON_HISTORY.md).

## Development Roadmap

- **COMPLETED:** Foundation
- **COMPLETED:** League documentation
- **COMPLETED:** Infrastructure
- **COMPLETED:** Counter-Strike staff and scouting
- **COMPLETED:** Episode Reconstruction Phase A
- **COMPLETED:** Historical episode source recovery
- **COMPLETED:** Initial timeline normalization
- **COMPLETED:** Counter-Strike Founding Captain canonization
- **COMPLETED:** Canon Batch 36-42
- **COMPLETED:** Canon Batch 43-53
- **COMPLETED:** Canon Batch 54-56
- **COMPLETED:** Episodes 30-56 source normalization and canonization
- **NEXT:** Entity chronology and relationship enrichment
- **PLANNED:** Website
- **PLANNED:** CMS
- **PLANNED:** Statistics engine

## Current limitations

The story begins in early 2026. The current narrative date is November 7, 2026,
and the next competitive milestone is February 2027.

The current story episode is 56. Episodes 1 through 29 are reconstructed from
the archived historical PDF. Episodes 30 through 56 are reconstructed from the
authoritative normalized DOCX and Markdown source. Episodes 1 through 24
preserve original Portuguese titles but retain **TBD** current-canon English
titles. Episodes 25 through 29 preserve both current working titles and
historical titles. Exact dates for Episodes 30 through 54 remain **TBD**.
Episodes 55 and 56 are dated November 7, 2026.

Unknown names, dates, academy roles, facility specifications, contracts,
salaries, rankings, results, and statistics must not be invented.

The League package establishes three teams, fifteen player records, and its
coaches, mentors, executives, and supporting staff. The Counter-Strike package
establishes two teams, two fictional Head Coaches, recruitment rules, five role
archetypes, Caleb "Atlas" Mercer as the signed IGL and Founding Captain, and
two unsigned evaluation players plus one unsigned scouted prospect.
Reserved future concepts remain only in planning and have no active player
records, narrative appearances, or recruitment references. Source recovery
now covers all fifty-six episode records with explicit provenance and retcon
boundaries.
