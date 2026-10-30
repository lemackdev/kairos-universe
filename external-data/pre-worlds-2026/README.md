# Pre-Worlds 2026 Domestic Roster Research

Status: **researched-needs-review**, not an approved fictional canon baseline.
Research date: 2026-10-30. Worlds boundary: 2026-10-15.

This snapshot covers every participant in the requested six top-tier regional
systems, plus NACL. It does not import other lower leagues. It is not a live
roster feed and does not use Worlds-specific registrations in place of the
last domestic championship roster.

| League | Teams | Primary roster reference |
| --- | ---: | --- |
| LCK | 10 | [2026 Season](https://liquipedia.net/leagueoflegends/LCK/2026) |
| LPL | 14 | [Split 3](https://liquipedia.net/leagueoflegends/LPL/2026/Split_3), with regional-final and Split 2 exceptions below |
| LEC | 10 | [Summer](https://liquipedia.net/leagueoflegends/LEC/2026/Summer) |
| CBLOL | 8 | [Split 2](https://liquipedia.net/leagueoflegends/CBLOL/2026/Split_2) |
| LCS | 8 | [Summer](https://liquipedia.net/leagueoflegends/LCS/2026/Summer) |
| LCP | 8 | [Split 3](https://liquipedia.net/leagueoflegends/LCP/2026/Split_3) |
| NACL | 10 | [Summer](https://liquipedia.net/leagueoflegends/North_American_Challengers_League/2026/Summer) |

Totals: **68 brand records, 68 teams, 376 unique players, 379 event-roster
observations, 9 roster source records**. Names and role listings are factual
research, not copied articles, artwork, logos, or page templates.

## What These Records Mean

- `research/`: manually reviewed transcription of indexed tournament roster tables.
- `records/`: normalized, individually addressable records with stable IDs.
- `index/`: path-only indexes, relative to this snapshot root.
- `research.schema.json`: input schema; additional semantic checks run in the website validator.
- `manifest.json`: scope, exclusions, provenance and review status.
- A roster observation uses the tournament end as a reference boundary, not an
  exact lineup on that day and not a contract start or end date.
- Multiple main listings for one role and listed substitutes are retained.
  A single guaranteed starting five is not inferred.
- Players seen at two different events have one identity with separate
  observations. Photic, Moham and Hena were reviewed this way.
- Brand records are not claims about legal parent companies or ownership.

## Exceptions and Unresolved Questions

1. OMG and Ultra Prime did not enter LPL Split 3. Their latest available
   [Split 2](https://liquipedia.net/leagueoflegends/LPL/2026/Split_2) roster is
   retained as an explicitly older fallback, never a current contract roster.
2. TES, IG, WE and JDG use the later
   [Regional Finals](https://liquipedia.net/leagueoflegends/LPL/2026/Regional_Finals)
   listings. Worlds-only changes are outside this snapshot.
3. Maryville University / DarkZero Dragonsteel has a conflicting brand label
   across directories. The tournament-page name is retained pending review;
   no corporate rename or duplicate team is invented.
4. Source tables can contain multiple main-role entries. These are not
   silently collapsed or treated as simultaneous match lineups.
5. Source access was through search-indexed tournament-page excerpts. Direct
   page access returned HTTP 403 and was not bypassed. Exact page revisions
   and final official registration completeness could not be audited.
   Consequently this snapshot must remain `researched-needs-review`.
6. NRG's indexed NACL table lists Kisno at Jungle and Spica at Support. These
   unusual roles are preserved as source claims, not replaced from memory.

Unknown/unimported: legal player names, nationalities, residences, birth dates,
ages, contracts, tenure start/end dates, captains, salaries, staff, company
ownership, statistics, awards, results and later transfers. Nationality is
never inferred from a league or an icon.

## Build and Review

From `website/`:

```powershell
npm run scene:validate
npm run validate
```

The initial deterministic materializer is `npm run scene:materialize`. It
creates missing normalized records and indexes but refuses to overwrite any
existing differing record. Ordinary site builds only read this snapshot.
For corrections, review the evidence and create a new snapshot, or make an
explicit, audited correction to both research and matching records. Never
silently update a frozen source observation.

The old `leaguepedia-2026-08-03` snapshot and KairosDB's selected baseline are
unchanged. This new collection is exposed separately by Kairospedia's external
publication manifest, never merged into `data/` or historical episode sources.

See [publication workflow](../../docs/kairospedia/EXTERNAL_SCENE_REFERENCES.md).
