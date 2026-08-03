# Kairospedia Overview

Kairospedia is the esports encyclopedia of the Kairos Universe.

It is a presentation and indexing layer over repository canon. It is not a
second source of truth and cannot write changes back into canonical records.

## Product scope

The architecture supports organizations, game-specific teams, people,
tenures, transfers, competitions, seasons, stages, matches, games, maps,
lineups, standings, statistics, awards, sources, and historical snapshots.

The first publication intentionally exposes only:

- Kairos Esports.
- Kairos League of Legends main team.
- Its five active players.
- Aphromoo, Thinkcard, and Emily Chen as directly associated League staff.
- Confirmed role mentorship relationships.

Academy teams, Counter-Strike teams, external organizations, competitions,
transfers, and matches remain unpublished.

## Canon boundary

Source priority remains:

1. Structured canon under `data/`.
2. Current canon documents under `docs/`.
3. Current world state and timeline.
4. Normalized episode sources.
5. Archived historical sources.

Unknown values remain `TBD`, `null`, empty, or omitted according to the
relevant schema. The interface may display `Unknown`, but it must never create
a substitute fact.

## Legal clarity

Kairospedia displays this notice on every page:

> Kairospedia documents a fictional esports universe. Fictional matches and
> events involving real-world organizations are not real-world results.

The visual system and implementation are original. No third-party wiki
branding, source code, template, stylesheet, logo, or proprietary asset is
used.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Global data model](GLOBAL_DATA_MODEL.md)
- [Publication workflow](PUBLICATION_WORKFLOW.md)
- [Content and source policy](CONTENT_AND_SOURCE_POLICY.md)
