# Documentation Standards

This document is the style guide for every canonical document, structured
record, index, schema, and future wiki-generated artifact in Kairos Universe.

## 1. Canonical authority

Canonical information must be supported by the current source-of-truth files.
Use the following sources together:

1. Entity records under `data/`.
2. Current canonical documentation under `docs/`.
3. [Current world state](../world-state/CURRENT_WORLD_STATE.md).
4. [Master timeline](../timeline/MASTER_TIMELINE.md).
5. [Retcon history](../retcons/RETCON_HISTORY.md).
6. [Canon rules](CANON_RULES.md).

Indexes are navigation artifacts, not independent canon. Schemas describe valid
record structure, not fictional facts. Shared datasets define reusable
vocabulary, not narrative events.

## 2. IDs

- Every entity and reusable vocabulary entry must have a stable ID.
- IDs use lowercase kebab-case.
- IDs must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- IDs must not be reassigned to a different subject.
- Shared vocabulary IDs use a category prefix, such as `game-`,
  `status-`, or `relationship-type-`, to prevent collisions.
- A renamed entity keeps its original stable ID unless canon establishes that
  it is a different entity.

## 3. Slugs

- Entity slugs use lowercase kebab-case.
- Slugs must be stable and unique among top-level entity records.
- A slug is not a display name.
- A display-name change does not automatically require a slug change.
- Cross-file relationships use stable IDs, not display names or filenames.

## 4. File naming

- Canonical Markdown documents use uppercase snake case, for example
  `CURRENT_WORLD_STATE.md`.
- Structured entity files use lowercase kebab-case, for example
  `noah-rkn-bennett.json`.
- Episode record filenames use `episode-NNN.json` with three-digit numbering.
- JSON Schema files use lowercase singular names with `.schema.json`.
- Index filenames use lowercase plural entity names.
- The root `README.md` and `kairos-version.json` retain their designated names.

## 5. Folder naming

- Folder names use lowercase kebab-case.
- Entity records belong in the matching folder under `data/`.
- Reusable vocabulary belongs in `data/shared/`.
- Validation schemas belong in `schemas/`.
- Path-only entity indexes belong in `index/`.
- Canonical prose belongs in the most specific folder under `docs/`.
- Documentation for future scripts belongs in `scripts/` until implementation
  is explicitly authorized.

## 6. Markdown formatting

- Use one level-one heading per file.
- Use concise, descriptive headings in title case.
- Keep paragraphs short and lists scannable.
- Use tables for stable field mappings and roster summaries.
- Use fenced code blocks for exact JSON, paths, or commands.
- Use relative links for project-local references.
- Do not leave broken links or trailing whitespace.
- Do not use Markdown formatting to imply a fact is confirmed when it is not.

## 7. JSON formatting

- JSON uses UTF-8 without a byte-order mark.
- Use two-space indentation.
- End every JSON file with a newline.
- Do not use comments or trailing commas.
- Preserve the property order established by the corresponding schema.
- Use lowercase kebab-case IDs and slugs.
- Use arrays for repeatable values, even when currently empty.
- Use empty arrays or objects for confirmed absence of recorded entries.
- Use `null` only when the schema explicitly permits it.
- Unknown episode titles, summaries, and exact dates use `null` when permitted
  by the episode schema.
- Use the literal string `TBD` for a required scalar whose value is unknown.
- Never duplicate full entity data inside another entity or index when a stable
  ID or path reference is sufficient.

## 8. TBD usage

Use **TBD** when a required detail is unknown, undecided, or not yet verified.

Examples:

- Unknown exact calendar day within a confirmed story period.
- Unknown contract date.
- Unknown academy role.
- Required scalar fields awaiting episode reconstruction.

TBD must not replace a publicly verifiable, non-fictional fact that can be
reliably confirmed. TBD is not permission to infer or guess.

## 9. UNCONFIRMED usage

Use **UNCONFIRMED** for a specific claim or possibility that exists but lacks
canonical support.

An unconfirmed claim:

- Must not appear in `confirmedFacts`.
- Must not be converted into a structured relationship.
- Must not be used to fill a statistic, result, date, contract, or biography.
- Must be resolved or removed before publication as a confirmed wiki fact.

## 10. Retcon process

When established canon is removed or replaced:

1. Add a structured entry to
   [RETCON_HISTORY.md](../retcons/RETCON_HISTORY.md).
2. State the old concept, current canon, reason, and effective date when known.
3. Remove the obsolete claim from current world-state and entity records.
4. Preserve historical context only inside the retcon log or explicitly dated
   historical material.
5. Update all affected indexes, references, and version metadata.

Retconned information must never remain as active canon.

## 11. Cross-references

- JSON entity relationships use stable IDs.
- Markdown uses correct relative links.
- Narrative character records belong under `data/characters/`.
- Episode narrator, protagonist, character, and first-appearance IDs must
  resolve to current canonical entities.
- Team roster references must resolve to player records.
- Coach and mentor references must resolve to records under `data/coaches/`.
- Index entries contain only repository-relative file paths.
- Every indexed path must exist.
- Every episode source path must exist within the repository.
- Do not create circular prose links merely for completeness.

## 12. Shared vocabulary

Shared datasets use a consistent entry shape:

```json
{
  "id": "category-stable-id",
  "name": "Human-readable name",
  "value": "Stored record value"
}
```

Add a shared value only when a current canonical record or authorized schema
needs it. Keep each dataset alphabetically ordered by ID. When a shared enum
changes, update the relevant schemas in the same change.

See [shared data](../../data/shared/games.json) for current examples.

## 13. Index maintenance

- Indexes contain repository-relative file paths only.
- Paths use forward slashes.
- Paths are sorted alphabetically.
- Entity information must not be duplicated in an index.
- Add new entity files to the corresponding index in the same change.
- Remove an index entry only when the referenced file is intentionally removed
  or relocated.

## 14. Schema maintenance

- Schemas use JSON Schema Draft 2020-12.
- Required canonical fields must appear in `required`.
- Optional fields remain optional.
- Reuse definitions from
  [common.schema.json](../../schemas/common.schema.json).
- Enums must remain synchronized with shared datasets.
- A schema change must not silently change canon.

## 15. Episode records

- Episodes use stable IDs and slugs in the form `episode-NNN`.
- `episodeNumber` and `publicationOrder` are separate fields from story
  chronology.
- Placeholders must use `recordStatus: placeholder`.
- Placeholders must not contain unsupported titles, summaries, events,
  characters, first appearances, locations, or consequences.
- Partially reconstructed episodes must list all missing source information.
- Source-recovered episodes preserve `historicalTitle`, immutable
  `archiveSource` page ranges, and any duplicate page ranges.
- Historical conflicts belong in `historicalNotes`, `continuityNotes`, or
  `retcons`; they must not silently enter current confirmed facts.
- Real people, teams, competitions, and platforms used as setting context
  belong in `realWorldReferences` when no local canonical entity is justified.
- Source references record source type, path, locator, evidence level,
  confidence, and whether user confirmation remains necessary.
- Retconned draft content belongs only in `retcons` or explicit non-canonical
  notes.
- Original prose and structured summaries are separate artifacts.
- Narrator and protagonist identity belongs in episode metadata. Do not rewrite
  historical prose to insert a later-confirmed identity.

See [EPISODE_DOCUMENTATION.md](../episodes/EPISODE_DOCUMENTATION.md).

## 16. Writing style

- Write canonical documentation in English.
- Prefer direct factual statements.
- Distinguish confirmed facts, plans, goals, and completed events.
- Do not invent detail to make a record appear complete.
- Clearly distinguish real-world background from fictional Kairos involvement.
- Avoid promotional language in source-of-truth records.
- Use consistent game, team, role, and organization names.

## 17. Version updates

Update [kairos-version.json](../../kairos-version.json) when:

- A documentation phase is completed.
- Canon changes materially.
- A retcon is approved.
- Episode reconstruction advances the current episode.
- The website or internal tooling implementation status changes.

Do not invent validation dates. Keep `lastValidated` as `null` until an
authorized process records a real date.

## 18. Canonical update process

For each approved change:

1. Identify the affected entity and canonical documents.
2. Verify existing IDs before creating new ones.
3. Update entity records and shared vocabulary where necessary.
4. Update indexes.
5. Update current world state and timeline when narrative state changes.
6. Add a retcon entry when established canon changes.
7. Update version metadata when the phase or canon version changes.
8. Parse all JSON and inspect schemas.
9. Check IDs, references, indexes, and Markdown links.
10. Confirm the website and unrelated files remain untouched unless they were
    explicitly in scope.
