# Author Directive: IEM Dallas 2027 Invited Teams

**Canon status:** CONFIRMED
**Source type:** Direct author-confirmed canon directive (not sourced from episode prose)

Backs `data/competitive-world-overrides/iem-dallas-invites-2027.json`. IEM Dallas
2027 (2027-02-03 to 2027-02-14, Dallas, Texas) has sixteen invited teams, all
from the 2027 external Counter-Strike 2 roster import:

1. Team Vitality
2. Spirit
3. MOUZ
4. FURIA
5. Falcons
6. Aurora
7. Natus Vincere
8. G2 Esports
9. FaZe
10. Astralis
11. BC.Game
12. Team Liquid
13. M80
14. MIBR
15. paiN Gaming
16. Legacy

No invite date, format, groups, seeding, results, standings or qualification is
established. Rosters follow the existing Counter-Strike roster freeze.

Announced on 2027-01-28 (Episode 117): ESL at 9:30 PT. The invitee lists in the episode match this document exactly.

## Group stage

At the author's request the sixteen invited teams were drawn at random (unseeded draw) into four groups of four; the two best teams of each group advance. The draw is stored in `groupStage` of `data/competitive-world-overrides/iem-dallas-invites-2027.json`. Seeding, the schedule of matches, results, standings and qualification are not established.

Every group plays a round robin of six Bo3 matches (24 in total) in three rounds of two simultaneous matches; each match carries its `round`. The matches are shown in the Results section. The matches are listed in `groupStage.groups[].matches` with `mapsA`, `mapsB`, `roundsA` and `roundsB` set to `null` until played. Enter the maps won (2-0 or 2-1) and the total rounds of each side; the group tables show maps played (M), rounds won (RW), rounds lost (RL), round difference (RD) and the match record, and are ordered by wins, then round difference. No match date is established.

## Playoffs

The eight advancing teams (two best of each group) play a single-elimination bracket: four quarter-finals, two semi-finals and a grand final. Every match is a best of three until the grand final, which is a best of five (`matchFormat` of each round). The bracket is stored in `playoffs` of the invites file with every slot empty (`null`); the seeding and pairings are not established. Fill `teamAId` and `teamBId` of a match once they are known.

## Prize distribution

At the author's request the USD 1,000,000 prize pool is split by placement with every team slot still `TBD`: 1st USD 400,000, 2nd USD 150,000, 3rd-4th USD 75,000 each, 5th-8th USD 40,000 each and 9th-16th USD 17,500 each. These amounts are calculated, not announced by the organizer.

## Results so far (Episodes 125-128)

IEM Dallas 2027 is under way. The group draw above matches the episodes. Results narrated through 2027-02-07 are stored in `groupStage.groups[].matches` with `mapsA`, `mapsB`, `roundsA`, `roundsB`, `date` and a `maps` list (map, `scoreA`, `scoreB`; a null score means the episode names the map winner without the score, and then `roundsA` and `roundsB` stay null and the group table shows a dash for round totals of the teams involved).

| Date | Group | Result |
| --- | --- | --- |
| 2027-02-04 | A | FURIA 2-0 Team Liquid (Inferno 13-9, Overpass 13-10) |
| 2027-02-04 | C | Astralis 2-1 M80 (Cobblestone 13-11 Astralis; Train and Nuke scores not stated) |
| 2027-02-05 | A | Team Vitality 2-0 Team Liquid (Nuke 13-9; Dust II score not stated) |
| 2027-02-05 | A | FURIA 2-1 MIBR (Inferno 11-13, Overpass 13-7, Train 13-10) |
| 2027-02-05 | C | M80 2-0 BC.Game (Train 13-8, Nuke 13-11) |
| 2027-02-05 | C | paiN Gaming 2-1 Astralis (Cobblestone 9-13, Cache 13-8; Nuke score not stated) |
| 2027-02-06 | B | Legacy 2-1 FaZe (Train 11-13, Cache 13-10, Inferno 13-9) |
| 2027-02-06 | B | Falcons 2-0 Natus Vincere (Nuke 13-8, Dust II 13-11) |
| 2027-02-06 | D | MOUZ 2-1 Spirit (Inferno 9-13, Overpass 13-11; Train score not stated) |
| 2027-02-06 | D | Aurora 2-0 G2 Esports (Cache 13-7, Nuke 13-11) |
| 2027-02-07 | D | MOUZ 2-0 G2 Esports (Dust II 13-2, Inferno 13-5) |

Not narrated: Vitality x MIBR and paiN x BC.Game (round 1), every round-3 match, standings after the group stage, qualification, the playoff bracket and the final prize distribution. Kairos Gaming does not take part. The competition status is `active`.
