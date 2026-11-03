# Author Directive: 2027 League of Legends Tier 2 Regional Ecosystems

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

This document is the canonical source backing four Kairos Universe fictional
2027 League of Legends Tier 2 regional ecosystems, each with 8 teams:
**EMEA Masters** (Europe/EMEA), **LCK Challengers** (Korea), **LCP
Challengers** (Pacific), and **Circuito Desafiante** (Brazil).

## Fictional speculation, not a real-world report

Every team named below reuses a real-named organization as Kairos Universe
fictional continuity content, the same pattern already used for the 2027
Tier 1 regional restructuring (see
[`LEAGUE_REGIONAL_RESTRUCTURING_2027.md`](LEAGUE_REGIONAL_RESTRUCTURING_2027.md))
and the Counter-Strike geography directive. **This is not a report of any
real organization's actual current competitive status.** The author
confirmed these names to establish the eight participating organizations
per ecosystem only — not standings, results, series/game records, prize
distributions, or promotion/relegation outcomes, none of which are
canonized here.

## Separate from Tier 1

Each Tier 2 ecosystem is a distinct competitive ecosystem from its
corresponding Tier 1 league (LEC, LCK, LCP, CBLOL). A Tier 2 organization
does not automatically become a Tier 1 organization, and no automatic
promotion/relegation is established. Where a Tier 2 team name denotes a
known Tier 1 organization's academy/challenger branch, a parent-organization
relationship is recorded (`parentTeamId`) pointing at the existing
pre-Worlds 2026 reference team, but the two remain separate team entities
and are never merged:

- **LCK Challengers:** all eight teams are confirmed academy/challenger
  branches of the eight active LCK 2027 organizations (T1, Dplus, KT
  Rolster, Nongshim RedForce, SOOPers, DRX, FEARX, Hanwha Life Esports).
  DRX and FEARX exiting active LCK Tier 1 competition for 2027 does not
  close their Tier 2 structures: Kiwoom DRX Challengers and BNK FEARX Youth
  remain active LCK Challengers 2027 participants.
- **LCP Challengers:** CFO Academy (parent: CTBC Flying Oyster) and Ground
  Zero Academy (parent: Ground Zero Gaming) have an author-confirmed parent
  relationship. Frank Esports, SillySilly Gaming, Reignfall, Sponge Gaming,
  EWH, and RogerSaMa have no confirmed Tier 1 parent in this directive.
- **Circuito Desafiante:** paiN Academy (parent: paiN Gaming) has an
  author-confirmed parent relationship. Estral Esports, KaBuM! IDL, VKS
  Academy, INTZ, RMD Gaming, Ei Nerd Esports, and 7REX have no confirmed
  Tier 1 parent in this directive.
- **EMEA Masters:** no parent-organization relationship is established by
  this directive for any of the eight teams, even where a name denotes a
  known LEC organization's brand (e.g. G2 NORD, Karmine Corp Blue, Movistar
  KOI Fénix). These remain distinct, separately tracked competitive
  entities.

## No rosters, no results, no international qualification

No player roster is invented for any Tier 2 team; none currently has
sourced roster data in this repository. No Tier 2 team receives automatic
qualification into Crossroads Challengers, Rift Masters Challengers, WSCI,
or any other international competition; qualification must be earned later
through the fictional 2027 competitive structure.

## Data model

- `data/competitive-world-overrides/emea-masters-2027.json`,
  `lck-challengers-2027.json`, `lcp-challengers-2027.json`,
  `circuito-desafiante-2027.json` — one file per ecosystem, 8 teams each.
- The pre-existing generic `lec-tier-2-2027`, `lck-tier-2-2027`,
  `lcp-tier-2-2027`, and `cblol-tier-2-2027` competition records are
  renamed in place (display name and overview only; IDs/slugs preserved)
  to EMEA Masters 2027, LCK Challengers 2027, LCP Challengers 2027, and
  Circuito Desafiante 2027 respectively, rather than duplicated.
- Loaded, cross-validated for referential integrity (parent team IDs must
  resolve to an existing pre-Worlds 2026 reference team or be null), and
  attached to the build catalog as `catalog.worldState2027.tier2Leagues` by
  `website/scripts/build-canon.ts`.
- Rendered on `/wiki/world` alongside the Tier 1 2027 sections, under the
  same fictional-speculation disclaimer.

## NACL 2027 and LDL 2027 (formalization addendum)

A follow-up author directive
(`source-canon-directive-2027-nacl-ldl-tier-2-formalization`) formalizes the
two remaining Tier 2 ecosystems that the regional-restructuring directive
tracked but did not yet detail in full: **NACL** (North America) and
**LDL** (China). Together with the four ecosystems above, this completes
all six major Tier 2 regional ecosystems at 8 active teams each (48 Tier 2
teams total, alongside 48 Tier 1 teams).

### NACL 2027

NACL continues to be modeled inside
`data/competitive-world-overrides/league-regional-membership-2027.json`
(`regions.NACL`), consistent with how it was already tracked by the
regional-restructuring directive, rather than as a new `tier2Leagues` entry.
Confirmed 2027 active teams: Kairos Academy Blue, Blue Otter, Dorado
Gaming, Maryville University, NRG, Sentinels, University of Mississippi,
Winthrop University.

- **Kairos Academy Blue** uses the existing `kairos-lol-academy-blue` team
  record and its existing five-player roster; this is not a new team or
  roster. It becomes Kairos Esports' official active NACL representative
  effective 2027-01-01, and remains a distinct entity from Kairos Gaming
  (LCS Tier 1, `kairos-lol-main`) and Kairos Academy White (developmental,
  non-NACL). No automatic promotion exists between any of the three.
- **Sentinels:** the repository's only existing "Sentinels" team record
  (`external-lol-team-sentinels`) represents the organization's Tier 1 LCS
  roster and remains separately active in the LCS region. Per the same
  "do not merge historical competitive memberships" principle applied to
  Oh My God below, the NACL participant is recorded as a distinct entity
  (`tier2-nacl-sentinels`, `parentTeamId: external-lol-team-sentinels`)
  rather than reusing the Tier 1 record, so the Tier 1 and Tier 2 rosters
  are never conflated.
- **CCG Esports, Contingent Esports, and Conviction** exit active NACL
  competition effective 2026-12-31, remain fully preserved in the frozen
  2026 reference scene, and their rostered players become Free Agents in
  `free-agents-2027.json`.
- **Cupid eSports** is not named in the author's confirmed NACL active
  roster or explicit departures list. It is recorded inactive (effective
  2026-12-31) and its players recorded as Free Agents for consistency with
  the confirmed exact-8-active-team count, and flagged in both the data
  and the project's final report as a discrepancy for author review rather
  than silently dropped.
- The pre-existing generic `lcs-tier-2-2027` competition record is renamed
  in place to NACL 2027 (ID/slug preserved).

### LDL 2027

LDL is modeled as a new `tier2Leagues` entry in
`data/competitive-world-overrides/ldl-2027.json`, matching the structure
used for EMEA Masters / LCK Challengers / LCP Challengers / Circuito
Desafiante. Confirmed 2027 active teams: BLG Junior, TES Challenger, Oh My
God, EDG Youth Team, WBG Youth Team, LGD Young Team, WE Academy, AL Young —
each a distinct competitive entity (own `teamId`) from its LPL Tier 1
parent, linked via `parentTeamId` (Bilibili Gaming, Top Esports, Oh My God,
EDward Gaming, Weibo Gaming, LGD Gaming, Team WE, Anyone's Legend
respectively).

- **Oh My God:** the confirmed LDL list requires the identical display
  name "Oh My God" as the existing active LPL Tier 1 "Oh My God" team
  record. Per the author's explicit instruction, no alternate name (e.g.
  "OMG Academy") is invented, and the two are kept as separate team
  entities (`tier2-ldl-oh-my-god` vs. `external-lol-team-oh-my-god`) with a
  `parentTeamId` link, so the Tier 1 record's active LPL membership is
  never merged into or confused with the Tier 2 record.
- **EDG Youth Team, LGD Young Team, and WE Academy** remain active LDL
  2027 participants even though their parent organizations (EDward Gaming,
  LGD Gaming, Team WE) exited active LPL Tier 1 competition for 2027; a
  parent's Tier 1 departure does not remove its Tier 2 development team.
- The pre-existing generic `lpl-tier-2-2027` competition record is renamed
  in place to LDL 2027 (ID/slug preserved, `teamsCount` set to 8, region
  set to China).
