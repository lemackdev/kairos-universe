# Author Directive: 2027 LCS Rosters, Retirements, and Identity Audit

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

Backs `data/competitive-world-overrides/lcs-rosters-2027.json`: the Kairos
Universe 2027 LCS starting lineups, the twelve named retirements, and the
identity decisions below. The Counter-Strike roster freeze is documented
separately in
[`COUNTER_STRIKE_EXTERNAL_ROSTER_FREEZE_2027.md`](COUNTER_STRIKE_EXTERNAL_ROSTER_FREEZE_2027.md).

All eight lineups were intended starting rosters by **2027-01-27**
(`confirmedBy`). No signing dates, contract terms, salaries, buyouts, or agents
are established, and no LCS match, standing, or qualification is implied.

## Lineups

| Team | Top | Jungle | Mid | ADC | Support |
|---|---|---|---|---|---|
| Kairos Gaming | rkN | Vanta | 404 | Aster | Moss |
| Cloud9 | Zamudo | eXyu | DARKWINGS | Tactical | Busio |
| Dignitas | Denathor | KryRa | Palafox | ScaryJerry | Breezy |
| FlyQuest | arbrio | Gryffinn | Insanity | sajed | Vulcan |
| LYON | Crimson | Armao | APA | Massu | Redemption |
| Sentinels | Dhokla | Dardoch | PhyMini | Tomo | Spica |
| Shopify Rebellion | JRockets | Contractz | Ablazeolive | Mobility | Zyko |
| Team Liquid | Berik | Blaber | jojopyun | Yeon | Zeyzal |

Kairos Gaming's five players are the existing internal characters and are
unchanged. Spica is intentionally a Support in 2027; the author states he
changed position from jungler. The frozen 2026 reference lists him as NRG
Support, and no transition dates are established.

## Identity decisions

- `KyRa` in the author's list is `KryRa`, existing record
  `external-lol-player-kryra` (author-confirmed).
- `eXyu` (Lawrence Lin Xu, United States, born 2001-12-14, Jungle) is not in the
  frozen pre-Worlds 2026 reference scene. He is added as
  `external-lol-player-exyu` in the 2027 overlay (`addedPlayers`), sourced from
  https://lol.fandom.com/wiki/EXyu and the Leaguepedia 2026-08-03 snapshot
  (Dignitas Jungle, joined 2025-12-19). He is not retired in this continuity.
- All other players reuse their existing `external-lol-player-*` IDs.

## Retirements (author-confirmed, January 2027 restructuring)

Loki (Cloud9), IgNar (Dignitas), Callme (Disguised), Impact, Hambak, Rahel, and
huhi (Sentinels), Bvoy (Shopify Rebellion), Morgan and CoreJJ (Team Liquid),
Gakgos and Quad (FlyQuest). Career history is preserved; no announcement dates,
ceremonies, statements, or reasons are established. No other player is retired.

## Free agency reconciliation

Players previously listed in `free-agents-2027.json` who now have a confirmed
2027 assignment or retirement are removed from the current free-agent list. The
earlier free-agent period is preserved as `priorStatus` on their roster or
retirement entry.
