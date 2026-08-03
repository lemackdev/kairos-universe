# Episode Documentation

**Document type:** Episode record and reconstruction guide

## Purpose

Episode records preserve narrative events in a form that can be validated,
searched, cross-referenced, and later rendered by the wiki. A record summarizes
canon and continuity effects. It does not replace or recreate the episode's
original prose.

The current structured model is defined by
[episode.schema.json](../../schemas/episode.schema.json).

## Record Types

### Original Prose

The authored narrative text of an episode. It may contain dialogue, scene
descriptions, pacing, and narrative voice. Original prose should be preserved
separately and must not be rewritten to match current canon. Recovered
historical and normalized sources are cataloged in the
[Historical Source Manifest](../../archive/SOURCE_MANIFEST.md).

### Structured Episode Record

The JSON source-of-truth record under `data/episodes/`. It identifies the
episode, records supported events and consequences, cites sources, and states
what remains missing.

Every original episode record identifies `adrian-elias-vale` as its narrator
and protagonist through metadata. This identification does not alter the
historical first-person prose, where the narrator remains unnamed.

### Episode Summary

A concise factual description of supported episode events. It describes what
happened without recreating dialogue or missing narrative prose.

### Canon Consequence

A durable effect produced by an episode, such as a staff appointment, roster
state, organizational decision, or new ongoing objective.

### Continuity Note

Information needed to interpret an episode consistently with earlier and later
canon. A continuity note may explain ordering, uncertainty, source limits, or a
dependency without establishing a new event.

### Retcon

A documented removal, replacement, or reinterpretation of earlier material.
Every episode-level retcon must reference
[RETCON_HISTORY.md](../retcons/RETCON_HISTORY.md) and must not present removed
material as current canon.

### Reconstruction Placeholder

A record confirming that an episode number exists while its story content
remains unavailable. A placeholder contains source gaps and recovery notes, not
a fabricated title, summary, date, character list, location, or event.

A placeholder is never a completed episode record.

### Historical Title

The title printed in the archived source. It is stored separately from the
current title because a current-canon English title may be **TBD** or may differ
from the historical Portuguese title.

### Historical Note

A source-backed detail that must remain discoverable but does not belong in
current canon, such as a retconned nickname, outdated chronology, factual
error, exact facility detail, or duplicate-source note.

## Status Dimensions

- `recordStatus` describes how complete the structured episode record is.
- `canonStatus` describes whether the material belongs to current continuity.
- `reconstructionStatus` describes whether source recovery is still required.
- `confidence` describes the quality and directness of supporting evidence.

These fields must not be collapsed into one status. A confirmed episode may
still have only a placeholder record, and a partially reconstructed record may
contain confirmed facts while still requiring original prose.

## Future Episode Workflow

1. Write or receive the episode.
2. Preserve the original prose separately if desired.
3. Create the structured episode record.
4. Record characters and organizations involved.
5. Record canon introduced.
6. Record consequences.
7. Update character timelines.
8. Update team and organization records.
9. Update the [master timeline](../timeline/MASTER_TIMELINE.md).
10. Update the [current world state](../world-state/CURRENT_WORLD_STATE.md).
11. Update the [episode index](EPISODE_INDEX.md).
12. Increment the canon version when appropriate.
13. Run validation.

## Reconstruction Workflow

1. Recover an original episode or authoritative conversation export.
2. Preserve source provenance and identify the episode number explicitly.
3. Compare the source with current canon and the retcon log.
4. Record supported events without recreating missing prose.
5. Separate current canon, draft material, inference, and retconned material.
6. Assign first appearances only when the source explicitly supports them.
7. Update the record status and confidence based on evidence quality.
8. Update affected entities, world state, timeline, index, and retcon records.
9. Validate references and continuity before treating the record as complete.

## Historical Source Integration

1. Preserve supplied source artifacts byte-for-byte before any documented
   searchable normalization.
2. Record its checksum and page map.
3. Store the historical title and page range in the episode record.
4. Apply current repository canon before the historical source.
5. Keep conflicts in `historicalNotes`, `continuityNotes`, or `retcons`.
6. Keep real-world references separate from fictional entity claims.
7. Never use duplicate source pages to create a duplicate episode record.

## Source Requirements

Every factual episode claim must cite a source reference with:

- Source type
- Existing repository path
- Section or locator
- Information supported
- Explicit or indirect evidence level
- Confidence
- Whether more user confirmation is required

An indirect timeline position does not prove an episode number. Inference must
be labeled and cannot override confirmed evidence.

## Current Reconstruction Boundary

- Episodes 1 through 29 are reconstructed from the archived historical source.
- Episodes 30 through 56 are reconstructed from the normalized source package.
- Episodes 57 through 75 are reconstructed from their preserved DOCX and
  normalized searchable Markdown source.
- Episodes 1 through 24 retain **TBD** current titles and preserve their
  historical Portuguese titles separately.
- Episode 75 is the current story episode.
- The story year is 2026. Episodes 55 and 56 are dated 07/11/2026;
  exact dates for Episodes 30 through 54 remain **TBD**. Episodes 57 through 75
  have source-confirmed dates from 08/11/2026 through 24/11/2026.

See [Episode Reconstruction Status](EPISODE_RECONSTRUCTION_STATUS.md) and
[Source Gaps](SOURCE_GAPS.md). Material source normalizations for the current
batch are listed in
[Episodes 57-75 Source Normalization](EPISODES_057_075_NORMALIZATION.md).
