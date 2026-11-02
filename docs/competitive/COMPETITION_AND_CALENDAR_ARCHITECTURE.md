# Competition and Calendar Architecture

**Canon status:** CONFIRMED (architecture) — see
[`COMPETITIVE_CALENDAR_2027.md`](../canon/COMPETITIVE_CALENDAR_2027.md) for the
author-confirmed dates, locations, prize pools, and tiers this architecture
holds.

This document explains the shared, reusable competitive-event system added
for both Counter-Strike and League of Legends: how a tournament is modeled
from organizer down to stage, how the calendar and competition pages are
built from that data, and the narrative-continuity rules the data
intentionally does not break.

## Organizer → Series → Event → Stage

| Entity | Collection | Schema | Example |
| --- | --- | --- | --- |
| Organizer | `organizers` | `organizer.schema.json` | ESL, PGL, BLAST, Riot Games |
| Series | `competition-series` | `competition-series.schema.json` | Intel Extreme Masters (ESL), Counter-Strike Major (co-organized) |
| Event / Competition | `competitions` | `competition.schema.json` | IEM Dallas 2027, Crossroads Cup 2027 |
| Stage | `stages` | `stage.schema.json` | LCS 2027 Stage 1, LCS 2027 Championship Stage |

A **series** is optional on a competition (`seriesId`, nullable) — most
standalone events (e.g. `BLAST Toronto 2027`, `PGL Chicago 2027`) have no
series and reference only their `organizerId`. The "Major" classification is
a competition `tier` value (`"major"`), not a separate organizer or series,
per the author's instruction that a Major is an event classification, not an
organizer. The `Counter-Strike Major` series itself has no fixed
`organizerId` because different organizers (PGL, StarLadder) run different
editions.

**Stages** already existed in the schema set before this change
(`stage.schema.json`, registered in the `stages` collection) and are reused
here for the League regional Tier 1 competitions (`LCS 2027`, `LEC 2027`,
etc.), each of which has four stage records (`Stage 1`, `Stage 2`, `Stage 3`,
`Championship Stage`) referencing the parent competition by `competitionId`.
No new qualifier/stage records were created for the new Counter-Strike events
or for League Tier 2 regions, per the instruction not to invent unnecessary
qualifier structure before it is needed — the architecture (the `stages`
collection and the competition `parentCompetitionId` /
`relatedCompetitionIds` fields) supports adding them later without a schema
change.

## The `competition` record

`competition.schema.json` is the existing generic event schema (already
powering `/wiki/competitions` and `/wiki/competitions/[slug]` before this
change, via `TournamentArticle`). It was extended additively — every new
field is optional, so every previously confirmed competition record
(Crossroads Cup, Rift Masters, etc.) remained valid without modification:

- `organizerId`, `seriesId` — links into the two new collections above.
- `tier` — `premier | major | tier-2 | tier-1-international |
  tier-2-international | world-championship | tier-2-world-championship |
  regional-tier-1 | regional-tier-2 | postseason-international | TBD`.
- `region` — `north-america | europe | international | TBD`. Used by the
  calendar's Region filter and by the Counter-Strike geography rule below.
- `teamsCount`, `eventType` (`lan | online | hybrid`), `inviteDate`,
  `rankingDate` — HLTV-style event metadata, populated only where the author
  confirmed a number (e.g. Crossroads Cup's 16 teams), otherwise `"TBD"` /
  `null`.
- `parentCompetitionId`, `relatedCompetitionIds` — for qualifier → main-event
  and series-sibling relationships. Populated today only implicitly through
  `seriesId` (the website derives "Related Events" from shared `seriesId`,
  see below) and through each League Tier 2 regional record's
  `parentCompetitionId` pointing at its Tier 1 counterpart.
- `rulesetIds` — already existed (added for the Counter-Strike map-pool
  canon update); every 2027 Counter-Strike competition references the single
  global map-pool ruleset here instead of duplicating a map list per event.

## Competition participants (qualification philosophy)

A competition's existence never implies Kairos — or any team — has
qualified, is invited, or is attending. The existing `participantTeamIds`
field on a competition record is what the website actually renders
(`CompetitionView.participants`, and `kairosParticipating` is simply
`participants.length > 0`, since every publishable team in this continuity
is a Kairos team). Every one of the 55 competition records created or
migrated in this change has an **empty** `participantTeamIds`: no
participants, winners, placements, qualification methods, or seeds were
invented.

For future, richer qualification tracking, a new
`competition-participant.schema.json` / `competition-participants` collection
was added with the structured shape the spec asked for
(`competitionId`, `teamId`, `status` — `not-entered | invited |
qualifier-entered | qualified | attending | eliminated | completed` —
`qualificationMethod`, `qualificationRegion`, `seed`, `placement`, `prize`).
The collection is registered (loader, validator, empty index) but **contains
zero records** — it is architecture for a future canon update, not
populated data, and is not yet wired into `CompetitionView` rendering since
there is nothing in it.

## Schedule events (future narrative-continuity validation)

A `schedule-event.schema.json` / `schedule-events` collection was added for
the team-level, date-bounded timeline the spec describes (so a competition
window, qualifier, travel block, bootcamp, break, media day, or roster lock
can exist before opponents or matches are known). It supports a `visibility`
field (`public | internal | narrative-only`) so a future Kairospedia view
can expose only `public` entries. Like `competition-participants`, this
collection is registered but **empty** — no fictional schedule-event records
were created. It is intended to let a future validator answer "where was
Kairos CS Main between these dates?" without fabricating any answer today.

## Calendar page (`/wiki/calendar`)

`CalendarView` (a client component) takes the full list of published
`CompetitionView`s for 2027 and renders a monthly list (not a grid): one
section per month, with competitions grouped by the month of their
`startDate`. July always renders a single "COMPETITIVE BREAK" message
instead of a list, regardless of filters, because no 2027 competition has a
July `startDate` (enforced by `calendar.test.ts`). Competitions with no
confirmed `startDate` (the six League Tier 2 regional ecosystems) render
under a trailing "Date TBD" section instead of being hidden.

Filters (Game, Tier, Region, Participation, Team, Month) are applied
client-side over the same `CompetitionView[]` array; none of them change
what is fetched or hide confirmed-but-unqualified events — they only narrow
what's already published. The "Team" filter checks `participants` for a
specific Kairos team id; since no competition currently has any confirmed
participant, every team filter correctly returns zero events today, which is
the intended, honest result rather than an inferred one.

## Competition index (`/wiki/competitions`)

`CompetitionsIndexView` adds basic Game / Region / Organizer / Status
filtering on top of the existing generic tournament list, complementing the
calendar's chronological view with a browsable one, per the instruction to
keep the two views distinct (calendar = chronological, competitions index =
searchable database).

## Counter-Strike geography

Per direct author instruction, the fictional 2027 Counter-Strike calendar is
deliberately North-America-heavy — about 80% of the 20 Premier events and
about 86% of the 14 Tier 2 events are located in the United States or
Canada — specifically so that Kairos, based in Los Angeles, is not written
as spending most of its competitive year traveling to Europe. This is an
intentional authorial/narrative choice for this fictional continuity, not a
claim about real-world Counter-Strike's actual geography, and it is recorded
as such in [`COMPETITIVE_CALENDAR_2027.md`](../canon/COMPETITIVE_CALENDAR_2027.md).

## Real-world names in a fictional continuity

ESL, PGL, BLAST, StarLadder, FISSURE, CCT, Elisa Masters, Fragadelphia, XSE,
Thunderpick, Esports World Cup, and Riot Games are real-world organizer
names reused inside the fictional Kairos Universe alternate continuity to
run these 2027 events, exactly as the existing canon already reuses
real-world esports figures (Pobelter, Doublelift, Goldenglue, WildTurtle,
etc.) in fictional roles. No real-world tournament history, results, or
organizational identity is implied or asserted; each organizer record notes
this explicitly.
