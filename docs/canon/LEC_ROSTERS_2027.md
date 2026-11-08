# Author Directive: 2027 LEC Rosters, Retirements, and Departures

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

Backs `data/competitive-world-overrides/lec-rosters-2027.json`: the Kairos
Universe 2027 LEC starting lineups, fourteen named retirements, and four players
leaving the LEC. The frozen pre-Worlds 2026 reference data is unchanged.

No exact collective announcement date has been approved for these lineups; they
belong to the January 2027 reconstruction period. `confirmedBy` is therefore
`null`, and former-team `Left` dates are intentionally unknown. The LCS date of
2027-01-27 is not reused. No signing dates, contracts, salaries, ratings,
results or standings are established.

## Lineups

| Team | Top | Jungle | Mid | ADC | Support |
|---|---|---|---|---|---|
| Fnatic | Myrwn | SkewMond | Vladi | Upset | Fleshy |
| G2 Esports | Naak Nako | Rhilech | Caps | Harpoon* | Labrov |
| GIANTX | Oscarinin | Lyncas | nuc | Flakked | Stend |
| Karmine Corp | Tracyn | Yike | Jackies | Supa | Zoelys* |
| Movistar KOI | BrokenBlade | Inspired | Kamiloo* | Hans Sama | Alvaro |
| Natus Vincere | Maynter | Daglas | Serin | Caliste | Parus |
| SK Gaming | Carlsen* | Razork | SlowQ | Aetinoth* | Mikyx |
| Team Vitality | Wunder | Elyoya | Fresskowy* | Carzzy | Myrtus* |

`*` Overlay identity: not in the frozen scene. Harpoon, Kamiloo, Carlsen, Aetinoth and
Fresskowy come from the Leaguepedia 2026-08-03 snapshot (exact nickname match);
Zoelys (Théo Le Scornec) and Myrtus (Mohamed Rahli) come from the
author-supplied Leaguepedia pages. Added as `external-lol-player-<nickname>`
(author-approved).

`Elyolya` in the author's list is `Elyoya` (existing `external-lol-player-elyoya`).

## Pending identities

None. Zoelys and Myrtus were initially unmatched; the author supplied their
Leaguepedia pages and approved them, so all 40 positions are identified.

## Retirements

Soboro, Lospa (Fnatic); Jun, ISMA (GIANTX); Canna (Karmine Corp); SamD (Natus
Vincere); Rooster, Paduck, Sheo (Shifters); Jopa, Skeanz (SK Gaming); Fiesta
(Team Vitality); Hype, Way (Team Heretics). ISMA, Skeanz and Sheo were resolved
from their single existing 2026 team histories (GIANTX, SK Gaming, Shifters; all
jungle). Career history is preserved; no announcement date is invented and no
coaching or other employment is assigned.

## Players leaving the LEC

| Player | Previous team | Eligible region | 2027 status |
|---|---|---|---|
| Busio | Karmine Corp | NA | Cloud9 (existing LCS assignment preserved) |
| jojopyun | Movistar KOI | NA | Team Liquid (existing LCS assignment preserved) |
| kyeahoo | Karmine Corp | KR | Available for the Korean market; unassigned |
| Poby | Natus Vincere | KR | Available for the Korean market; unassigned |

kyeahoo and Poby are not retired and are not assigned to any LCK organization.

## Former-team cleanup and vacancies

Every transferred, retired or departing player's previous 2026 tenure is
recorded as superseded in `departures` and the player is removed from that
team's active 2027 roster; the 2026 tenure itself is kept. Players who were
2027 free agents (nuc, Stend, Tracyn, Daglas, Serin) or whose free-agent entry
contradicted a retirement are removed from `free-agents-2027.json`; the earlier
status is kept as `priorStatus`. The Karmine Corp support and Movistar KOI mid
vacancies recorded with the LCS update are resolved by these lineups and
removed from `lcs-rosters-2027.json`.

## Eligibility

All eight LEC rosters are author-designated as regionally eligible. No
nationality was altered. Where the frozen scene has no nationality, none is
asserted. The Leaguepedia snapshot lists Inspired as Polish with North American
residency; residency alone grants no eligibility, and Poland is a European
territory, so no discrepancy is raised beyond this note.
