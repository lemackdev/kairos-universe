# Counter-Strike World Ranking 2027

**Canon status:** CONFIRMED (author-maintained)
**Data:** `data/competitive-world-overrides/cs-world-ranking-2027.json`
**Page:** `/wiki/rankings/counter-strike`

## Rules

- The ranking is maintained by hand. Each entry holds a team id, its HLTV world-ranking position and the position it held in the previous ranking.
- Only the Counter-Strike teams of the repository are listed, so the ranking runs from 1 to 52.
- The change column shows a plain dash for every team. No points or previous positions are recorded.
- Kairos Gaming (51) and Kairos Academy Green (52) are listed after the last external team at the author's request; they have no HLTV position.
- Rosters shown on the page are the frozen 2027 starting fives.

## Current snapshot

HLTV world ranking of 2026-11-09 (https://www.hltv.org/ranking/teams/2026/november/9): all 50 external repository teams are ranked, from MOUZ (#1) to LAG (#111). Previous positions come from HLTV's change column.

## Updating

Edit `position` and `previousPosition` in the data file, then run `npm run canon:prepare` from `website/`.
