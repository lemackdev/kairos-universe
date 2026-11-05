# Author Directive: 2027 Competitive Calendar

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

This document is the canonical source backing the full 2027 competitive-event
architecture: the Counter-Strike Premier and Tier 2 calendars, the League of
Legends international calendar, and the League regional (LCS/LEC/LCK/LPL/LCP/
CBLOL) Tier 1 and Tier 2 structures. No episode depicts a calendar
announcement; these dates, locations, prize pools, tiers, and competition
structures were supplied directly by the author as confirmed fictional canon
and recorded here per the author's own instruction, rather than inventing an
in-universe announcement scene that does not exist.

## Global calendar rules

- The 2027 competitive season begins 2027-02-01 globally (unchanged by the League Stage 1 revision below).
- **League Tier 1 Stage 1 revision (announced 2027-01-27, Episode 113):** Stage 1 for LCS, LEC, LCK, LPL, LCP, and CBLOL now runs **2027-02-15 through 2027-03-14**, superseding 2027-02-01 through 2027-03-14. The end date is unchanged and Stage 1 is not extended into First Stand. The emergency roster registration deadline is **2027-02-12**, superseding the initial 2027-02-06 deadline. First Stand 2027 remains 2027-03-20 through 2027-03-28 in Berlin, Germany. Stage 2, Stage 3, Championship Stage, the July break, and the Counter-Strike calendar are unchanged. Tier 2 leagues may adjust schedules, but no new Tier 2 dates are confirmed. See [`LEAGUE_IMPORT_BAN_AND_CALENDAR_REVISION_2027.md`](LEAGUE_IMPORT_BAN_AND_CALENDAR_REVISION_2027.md).
- A global competitive break runs 2027-07-01 through 2027-07-31 inclusive.
  No tournaments or qualifiers are scheduled during July for either game.
- December is relatively light and functions as season closure.
- A competition existing on the calendar does not mean Kairos has qualified
  for it. Kairos participation is tracked separately (see the
  `competition-participants` architecture) and is never automatic.

## Counter-Strike geography

The fictional 2027 Counter-Strike ecosystem is deliberately North-America-heavy
(~80% of Premier events, ~85% of Tier 2 events) for narrative continuity:
Kairos is based in Los Angeles and should not spend most of the year
travelling to Europe by default. This is an intentional authorial choice, not
a claim about real-world Counter-Strike geography.

## Counter-Strike map pool

Every 2027 Counter-Strike competition uses the permanent global map pool
defined in [`data/rulesets/counter-strike-global-map-pool.json`](../../data/rulesets/counter-strike-global-map-pool.json)
(Cobblestone, Inferno, Nuke, Overpass, Dust II, Train, Cache — no rotation,
no organizer-specific pools). See
[`COUNTER_STRIKE_GLOBAL_MAP_POOL.md`](COUNTER_STRIKE_GLOBAL_MAP_POOL.md).

## Full event list

See [`docs/competitive/COMPETITION_AND_CALENDAR_ARCHITECTURE.md`](../competitive/COMPETITION_AND_CALENDAR_ARCHITECTURE.md)
for the complete architecture explanation, and the `data/competitions/`,
`data/organizers/`, and `data/competition-series/` collections for the
individual structured records this directive backs.

## What is explicitly NOT established by this directive

- No tournament participants, winners, placements, MVPs, or match results.
- No Kairos qualification for any 2027 event.
- No prize-distribution breakdown beyond the total prize pool for each event.
- No CS event format beyond the shared map pool (format remains TBD per
  event unless a prior document already confirmed it, e.g. Crossroads Cup).
- No real-world history or real-world identity claims about the real-world
  organizations whose names are reused here (ESL, PGL, BLAST, StarLadder,
  FISSURE, Riot Games, etc.) inside this fictional alternate continuity.
