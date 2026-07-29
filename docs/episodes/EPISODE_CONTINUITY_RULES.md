# Episode Continuity Rules

**Canon status:** Governing documentation rules

## Source And Canon Separation

1. Later canon may clarify earlier episodes but cannot silently rewrite them.
2. Draft material must not be presented as current canon.
3. Retconned material must link to
   [RETCON_HISTORY.md](../retcons/RETCON_HISTORY.md).
4. Non-canonical development notes must remain separate from key events,
   consequences, and confirmed facts.
5. The absence of source information does not prove that an event did not
   happen.
6. Source priority is current repository, Canon Inconsistency Audit, then
   historical archive.
7. Preserved source artifacts are immutable. A searchable normalized
   transcription may change only through an explicit, checksummed
   normalization record.
8. A historical title is not automatically the current title.

## Dates And Order

1. Exact dates must not be invented.
2. Episode publication order and chronological story order are separate facts.
3. Publication order belongs in `publicationOrder`.
4. Story time belongs in `approximateStoryPeriod` and `exactStoryDate`.
5. A broad timeline position must not be converted into a precise episode
   number without explicit evidence.
6. A timeline sequence number is not an episode number.
7. Historical dates may be retained as historical notes without assigning them
   to current canon.

## Characters And First Appearances

1. A first appearance must not be assigned without explicit evidence.
2. A character mentioned only in retconned draft material must not enter the
   canonical `characters` or `firstAppearances` arrays.
3. Character IDs must resolve to stable current records unless the reference is
   confined to a structured retcon note.
4. Every original episode record identifies `adrian-elias-vale` as narrator
   and protagonist through metadata without rewriting the historical prose.
5. Later source recovery may clarify a first appearance, but the affected
   character record must be updated in the same change.

## Summaries And Missing Prose

1. Episode summaries describe supported events.
2. Summaries must not recreate missing dialogue, narration, scene detail, or
   prose.
3. Unknown titles remain `null` in structured records.
4. Unsupported characters, locations, events, and consequences remain empty.
5. Missing source material must be listed explicitly.
6. Recovered source conflicts must be documented instead of silently removed
   from the structured record.

## Confidence

- `unknown`: No episode-specific story evidence is available.
- `low`: Evidence is weak or highly indirect.
- `medium`: Multiple indirect sources support a claim but explicit mapping is
  absent.
- `high`: Strong repository evidence supports the claim.
- `confirmed`: An authoritative source explicitly confirms the claim.

Record-level confidence describes the evidence supporting populated content. It
does not mean that a partial record is fully reconstructed.

## Placeholder Rules

1. A placeholder must never be displayed as a completed episode.
2. A placeholder may confirm the numbered episode's existence.
3. A placeholder must not assign a title, summary, date, division, character,
   first appearance, location, team, event, or canon consequence without
   episode-specific evidence.
4. A placeholder must state that source recovery is required.
5. A placeholder must state that no story content was invented.

No placeholders currently remain for Episodes 1 through 56. These rules remain
in force for future unrecovered episodes.

## Real-World References

1. Real-world references must be distinguished from fictional events.
2. A real competition or organization used as setting context does not
   establish a fictional result, roster, ranking, contract, or participation.
3. Current real-world information must not be used to fill missing historical
   episode content.
4. A real-world person or organization may be recorded as a historical
   reference without creating a local entity when no current canonical entity
   record is justified.

## Update Requirements

Every new episode must update:

1. Its structured episode record.
2. [CURRENT_WORLD_STATE.md](../world-state/CURRENT_WORLD_STATE.md).
3. [MASTER_TIMELINE.md](../timeline/MASTER_TIMELINE.md) when chronology changes.
4. [EPISODE_INDEX.md](EPISODE_INDEX.md).
5. Affected character, team, organization, and competition records.
6. Global indexes.
7. The retcon log when established canon changes.
8. Version metadata when appropriate.

All updated JSON, schema references, entity references, index paths, and
Markdown links must be validated before publication.
