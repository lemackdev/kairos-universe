# Kairospedia Architecture

## Runtime boundary

The application is self-contained under `website/`.

- Framework: Next.js App Router.
- Language: TypeScript in strict mode.
- Rendering: React Server Components by default.
- Styling: repository-maintained global CSS.
- Package manager: npm.
- Database: none.
- CMS: none.
- Authentication: none.
- External wiki dependency: none.

## Build-time flow

1. `canon:build` reads repository JSON through a server-side loader.
2. Existing JSON Schemas validate canonical records.
3. Stable-ID references, indexes, dates, episodes, and roster invariants are
   checked.
4. `kairospedia-publication.json` limits visibility.
5. View models are generated without changing canon.
6. Route and search catalogs are written under `website/.generated/`.
7. Next.js renders only enabled routes.

`website/.generated/` is ignored because every file in it is derivative.

## Source locations

The loader reads:

- `../data/`
- `../index/`
- `../schemas/`
- `../kairos-version.json`

It never writes to those locations.

## Layers

| Layer | Responsibility |
| --- | --- |
| `src/lib/canon/` | Parse canon, calculate narrative ages, resolve tenures and lineups |
| `src/lib/validation/` | Validate schemas, indexes, references, chronology, and publication |
| `src/lib/catalog/` | Convert canonical records into safe publication view models |
| `src/lib/search/` | Build and query the local publication-only search index |
| `src/lib/formatting/` | Render unknown canonical values without guessing |
| `src/components/` | Reusable semantic encyclopedia components |
| `src/app/` | Public routes and page composition |
| `scripts/` | Build, validation, search, links, and entity-draft tooling |
| `tests/` | Data, publication, search, tenure, match, and route invariants |

## Historical resolution

Current profiles use `currentNarrativeDate` from `kairos-version.json`.
Historical roster and match pages must use the relevant event date.

The roster engine provides:

- `getTeamRosterAtDate`
- `getPlayerTeamHistory`
- `getActiveRoster`
- `getTeamStaffAtDate`
- `getMatchLineup`

An event page must never substitute the current roster for a historical
lineup.
