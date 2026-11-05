# Author Directive: 2027 League of Legends Regional Restructuring

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

This document is the canonical source backing the Kairos Universe fictional
2027 League of Legends regional-membership layer: which real-named franchises
are represented as active or inactive Kairos Universe 2027 regional
participants, the Disguised-to-Kairos LCS slot change, and 2027 free-agent
status for players whose team exited active regional competition.

## Critical distinction: 2026 reference vs. 2027 fictional world

- `external-data/pre-worlds-2026/` is a **frozen, real-world-sourced
  historical reference** (Liquipedia-sourced, pre-Worlds 2026 domestic
  rosters). It is not modified by this directive and remains accurate as a
  historical snapshot.
- `data/competitive-world-overrides/` is a **separate, clearly-labeled
  fictional speculation layer** for the Kairos Universe continuity. It
  records 2027 regional-membership and free-agent status by referencing the
  frozen 2026 records by ID. **It is not a report of any real organization's
  or real player's actual current competitive, contractual, or employment
  status.** Every file in this layer carries that disclaimer inline.

## Core 2027 regional rule

Effective 2027-01-01, each tracked League of Legends region is standardized
to **8 active teams**: LCK, LPL, LEC, LCS, LCP, CBLOL (Tier 1), and NACL
(tracked Tier 2). This is 48 active Tier 1 organizations plus 8 NACL
organizations, 56 tracked regional teams total.

The frozen 2026 reference snapshot's team counts (10 LCK, 14 LPL, 10 LEC, 8
LCS, 8 LCP, 8 CBLOL, 10 NACL) are unchanged and remain the historical record
of the world as it existed before this restructuring.

## Departing organizations (regional exit, effective 2026-12-31)

These organizations are represented as inactive / not participating in their
tracked 2027 regional competition. Their historical organization and team
pages, 2026 roster records, and player records are preserved unchanged.

- **LPL:** ThunderTalk Gaming, Ultra Prime, Ninjas in Pyjamas, Team WE,
  EDward Gaming, LGD Gaming
- **LCK:** DRX, FEARX
- **LEC:** Team Heretics, Shifters
- **LCS:** Disguised
- **NACL:** CCG Esports, Contingent Esports

13 organizations total. CBLOL and LCP already have 8 tracked teams each and
require no departures.

## LCS: Disguised to Kairos

Disguised exits active LCS 2027 regional competition effective 2026-12-31.
Kairos Gaming (`kairos-lol-main`, the existing Kairos League Main roster,
whose `intendedCompetition` was already `"LCS"`) is a confirmed active LCS
2027 participant effective 2027-01-01, entering the regional slot Disguised
vacated.

This is represented purely as a league-membership change. No acquisition,
purchase, franchise-purchase terms, financial relationship, player-transfer
relationship, or ownership relationship between Kairos and Disguised is
established or implied.

## Free agency

Every player whose team exited active 2027 regional competition becomes a
**Free Agent** in the Kairos Universe fictional 2027 world
(`data/competitive-world-overrides/free-agents-2027.json`), unless another
destination is already confirmed elsewhere in Kairos canon (none currently
are). No destination, transfer, or new organization is invented for any
player. No reason beyond "roster departure" is recorded.

## NRG

NRG remains an active NACL 2027 participant. An individual substitute-roster
entry previously recorded here has since been fully withdrawn from the
repository at author request, including the underlying frozen 2026 NRG
roster record. NRG's remaining 2026 roster record is otherwise unchanged.

## International qualification is unaffected

Regional 2027 membership does not grant international qualification. First
Stand, Crossroads Cup, Crossroads Challengers, MSI, Rift Masters, Worlds, and
the Tier 2 international structure remain governed by their own existing
qualification rules. The confirmed Crossroads Cup regional allocation (LCK 3,
LPL 3, LEC 3, LCS 3, LCP 2, CBLOL 2 = 16) is unchanged by this directive.
Kairos receives no automatic international qualification from its LCS 2027
regional membership.

## Data model

- `data/competitive-world-overrides/league-regional-membership-2027.json` —
  per-region active/inactive team status.
- `data/competitive-world-overrides/free-agents-2027.json` — per-player 2027
  free-agent status.
- Both reference the frozen `external-data/pre-worlds-2026` team/player IDs
  and are loaded, cross-validated for referential integrity, and attached to
  the build catalog as `catalog.worldState2027` by
  `website/scripts/build-canon.ts`.
- Kairospedia (`/wiki/world`, external team pages, external player pages)
  renders this layer with an explicit "fictional speculation, not a real
  report" disclaimer, visually and structurally separate from the frozen
  2026 reference content.

## Regional eligibility and calendar revision (2027-01-26 / 2027-01-27)

A later directive adds the 2027 regional player eligibility ruleset (import ban) and revises the League Tier 1 Stage 1 window. It does not alter the regional-membership layer above. See [`LEAGUE_IMPORT_BAN_AND_CALENDAR_REVISION_2027.md`](LEAGUE_IMPORT_BAN_AND_CALENDAR_REVISION_2027.md).
