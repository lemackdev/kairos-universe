# Canon Rules

These rules govern every document, structured record, asset description, and
future wiki page in Kairos Universe.

## 1. Canon status

1. Confirmed facts are canonical and may be presented as current truth.
2. Unconfirmed ideas must be labeled **UNCONFIRMED**.
3. Undecided or unknown details must be labeled **TBD**.
4. Soft canon must be labeled **SOFT CANON** and cannot override confirmed
   canon.
5. Retconned facts cannot appear as current canon. They belong in the
   [retcon history](../retcons/RETCON_HISTORY.md).
6. Non-canonical material must be labeled **NON-CANONICAL** and kept separate
   from source-of-truth records.
7. A contradiction must not be resolved through improvisation. Record the
   conflict as unconfirmed until a canonical decision is made.

### Source priority

When historical sources conflict with current canon, use this order:

1. Current repository canon.
2. [Canon Inconsistency Audit](../retcons/CANON_INCONSISTENCY_AUDIT.md).
3. [Archived historical source](../../archive/SOURCE_MANIFEST.md).

Preserve every conflicting version in its proper layer. Never invent a third
version as a compromise.

## 2. Stable records

1. Every important character must have a stable ID and slug.
2. IDs and slugs must use lowercase kebab-case and must not be reused for a
   different subject.
3. Every organization, division, team, tournament, season, match, and episode
   record must also use a stable lowercase kebab-case ID and slug.
4. Every episode must eventually have a structured record in `data/episodes/`.
5. A renamed subject keeps its stable ID unless canon establishes that it is a
   different entity.

## 3. World-state maintenance

1. Important changes must update the
   [current world state](../world-state/CURRENT_WORLD_STATE.md).
2. Every new episode must preserve the existing
   [master timeline](../timeline/MASTER_TIMELINE.md).
3. If an episode adds or changes a dated event, the master timeline must be
   updated.
4. If canon changes a previously established fact, the change must also be
   entered in the retcon history.
5. Historical records must preserve what was true at their documented story
   point without presenting obsolete facts as current.

## 4. Dates and chronology

1. No exact date may be invented when only a relative date is known.
2. Unknown dates and years must be written as **TBD**.
3. Confirmed event order and exact calendar dates are separate claims.
4. A planned event must be labeled as planned and must not be described as
   completed.
5. Episode numbers must not be invented during timeline reconstruction.

## 5. Episode reconstruction

1. A reconstruction placeholder confirms an episode record slot but is not a
   completed episode.
2. Missing prose, titles, dates, characters, dialogue, locations, and events
   must not be recreated through invention.
3. Every populated episode claim must cite actual evidence.
4. Broad timeline order does not prove a precise episode number.
5. Publication order and chronological story order must be stored separately.
6. A first appearance must not be assigned without explicit evidence.
7. Draft and retconned material must remain separate from current episode
   canon.
8. Record status, canon status, reconstruction status, and source confidence
   are separate claims.
9. The absence of information does not prove that an event did not happen.
10. Original episode prose is immutable historical evidence and must not be
    edited to match current canon.
11. A reconstructed episode record may normalize current canon while retaining
    the historical title, source pages, conflicts, and retcons.
12. Duplicate source pages must be documented rather than silently deleted
    from the archived file.

See the [episode continuity rules](../episodes/EPISODE_CONTINUITY_RULES.md).

## 6. Competitive and commercial claims

1. No result, title, contract, salary, ranking, or statistic may be fabricated
   without narrative confirmation.
2. A roster intention is not a signing.
3. A planned debut is not an official match.
4. A scouting candidate is not a signed player.
5. Competition participation must distinguish intention, qualification,
   invitation, and confirmed participation.

## 7. Real-world references

1. Real esports figures may exist in this fictional universe.
2. Their fictional involvement must be clearly documented as fictional canon.
3. The future wiki must distinguish fictional facts from real-world background
   references.
4. Real-world background must not be used to infer fictional results,
   relationships, contracts, or participation.

## 8. Change workflow

For each future episode or approved canon change:

1. Add or update its structured episode record.
2. Update the current world state.
3. Update the master timeline when chronology changes.
4. Update every affected entity record.
5. Add a retcon entry when an established fact is removed or replaced.
6. Check that Markdown and JSON sources agree before publishing wiki content.
