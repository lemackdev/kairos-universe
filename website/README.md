# Kairospedia Website

Kairospedia is the Next.js presentation and indexing layer for the Kairos
Universe canonical repository.

The canonical publication contains only Kairos Esports, the Kairos League of
Legends main team, its five active players, directly associated League staff,
and confirmed mentorship relationships.

A separate, clearly labeled pre-Worlds 2026 reference collection covers 68
teams across LCK, LPL, LEC, CBLOL, LCS, LCP and NACL, with 376 unique players.
Its evidence status is researched-needs-review, not approved fictional canon.
Start at `/wiki/world`. See [external reference policy](../docs/kairospedia/EXTERNAL_SCENE_REFERENCES.md).
The old KairosDB snapshot is not replaced.

## Requirements

- Node.js 22 or a compatible version supported by Next.js 16.
- npm.

## Install

```powershell
cd website
npm install
```

## Develop

```powershell
npm run dev
```

The development command validates and rebuilds the derivative canon catalog
before starting Next.js.

## Validate

```powershell
npm run validate
```

This runs canon generation, schema and reference validation, publication
validation, TypeScript, ESLint, tests, a production build, and internal-link
validation.

## Build

```powershell
npm run build
```

The build command automatically regenerates and validates
`website/.generated/` before running Next.js.

## Publication

Edit `kairospedia-publication.json` only after canonical records, tenures,
sources, and public pages are ready. The manifest controls visibility. It does
not change canon.

`kairospedia-external-publication.json` separately controls the external
snapshot and enabled leagues. `npm run scene:validate` checks individual
records, indexes, source references and coverage. The normal canon build
also performs these checks and never writes back to the source snapshot.

## Entity drafts

Safe draft commands require a stable ID and at least one existing source ID:

```powershell
npm run entity:new-player -- --id example-player --source source-id
```

Drafts are written under ignored `.generated/drafts/`. They never overwrite a
file or promote themselves into canonical data.

## Encyclopedia articles

Team, player, and tournament pages share compact article layouts with section
links, right-side infoboxes, responsive tables, and system light/dark themes.
The templates support both League of Legends and Counter-Strike.
See [Article templates](../docs/kairospedia/ARTICLE_TEMPLATES.md) for sections,
canonical inputs, and the tournament publication workflow.
