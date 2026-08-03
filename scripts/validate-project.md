# Future Project Validation Workflow

This document specifies the repository validation process. Kairospedia now
implements the executable validator under `website/`; the sections below remain
the validation contract.

Run:

```powershell
cd website
npm run validate
```

The command generates derivative catalogs, validates schemas and references,
checks publication and indexes, runs TypeScript and ESLint, executes tests,
builds production output, and validates internal links.

## Goals

The future validator should produce a deterministic report, return a nonzero
exit code on failure, and avoid modifying canonical files.

## 1. JSON parsing

- Discover every `.json` file under `data/`, `index/`, and `schemas/`, plus
  `kairos-version.json`.
- Parse every file as strict JSON.
- Reject comments, trailing commas, duplicate object keys when detectable, and
  malformed UTF-8.

## 2. Schema validation

- Validate schemas against JSON Schema Draft 2020-12.
- Resolve local references such as
  `common.schema.json#/$defs/stableId`.
- Validate each entity directory against its matching schema.
- Report the entity path, JSON pointer, rule, and invalid value.
- Do not auto-correct canonical records.

## 3. Duplicate ID detection

- Collect all top-level entity IDs and slugs.
- Collect all shared vocabulary IDs.
- Reject collisions between different subjects.
- Permit repeated values only when they are references to the same stable
  entity.
- Enforce lowercase kebab-case.

## 4. Broken reference detection

- Verify every team roster ID resolves to a player record.
- Verify coach and mentor IDs resolve to records under `data/coaches/`.
- Verify narrator and protagonist IDs resolve to records under
  `data/characters/`.
- Verify organization, team, competition, season, tournament, match, and
  episode references resolve to the expected entity type.
- Verify relationship subjects resolve when the target type is represented by
  structured data.
- Report references without silently removing them.

## 5. Broken Markdown links

- Scan every Markdown link in the repository.
- Resolve relative project-local paths from the linking document.
- Ignore external URLs for local existence checks.
- Report the source file, line, link text, and unresolved target.

## 6. Orphan-file detection

- Report entity files missing from their global index.
- Report indexed entity files that are unreachable from relevant canonical
  documentation when reachability rules are defined.
- Exclude intentionally empty placeholder directories.
- Exclude assets until asset manifests are introduced.

## 7. Index consistency

- Confirm every index is a JSON array of repository-relative paths.
- Confirm character records appear exactly once in `index/characters.json`.
- Require forward slashes and alphabetical ordering.
- Reject duplicate paths.
- Confirm every path exists and points to the expected entity directory.
- Confirm every entity file appears exactly once in its corresponding index.
- Reject duplicated entity information inside indexes.

## 8. Timeline consistency

- Preserve the confirmed event order in the master timeline.
- Distinguish completed events from planned events.
- Reject exact dates that conflict with canonical relative dates.
- Verify episode-to-event links after episode reconstruction begins.
- Flag impossible ordering without attempting to rewrite history.

## 9. Canon consistency

- Compare current world state, entity records, timeline, retcon history, and
  version metadata.
- Reject active use of retconned facts.
- Reject results, contracts, salaries, rankings, or statistics without
  canonical support.
- Verify real-world background remains distinct from fictional involvement.
- Flag contradictory captain, roster, role, or organization assignments.

## 10. Episode numbering validation

- Require unique positive episode numbers after reconstruction.
- Detect gaps, duplicates, and reversed order.
- Confirm the highest reconstructed episode does not exceed
  `kairos-version.json`.
- Allow unreconstructed episode records only when they are explicitly marked
  `TBD`.
- Do not infer episode numbers from timeline sequence positions.

## 11. Version and phase checks

- Confirm `canonVersion` follows semantic versioning.
- Confirm the story period exists in shared story-period data.
- Confirm `websiteImplemented` matches the actual implementation state.
- Confirm the current and next documentation phases match the README roadmap.
- Do not create or update `lastValidated` without explicit authorization.

## 12. Suggested report

The validator should report:

- Files parsed.
- Schemas checked.
- Entities validated.
- IDs and slugs checked.
- References checked.
- Index entries checked.
- Markdown links checked.
- Timeline and episode checks.
- Errors grouped by severity and file.

The active implementation uses TypeScript, AJV Draft 2020-12, Vitest, ESLint,
and the Next.js production build. Automation integration remains **TBD**.
