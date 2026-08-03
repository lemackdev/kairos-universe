# Kairospedia Website

Kairospedia is the Next.js presentation and indexing layer for the Kairos
Universe canonical repository.

The current publication contains only Kairos Esports, the Kairos League of
Legends main team, its five active players, directly associated League staff,
and confirmed mentorship relationships.

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

## Entity drafts

Safe draft commands require a stable ID and at least one existing source ID:

```powershell
npm run entity:new-player -- --id example-player --source source-id
```

Drafts are written under ignored `.generated/drafts/`. They never overwrite a
file or promote themselves into canonical data.
