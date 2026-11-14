# Episodes 107-128 Import Report

**Canon status:** CONFIRMED
**Source:** `107-128.pdf` (author-supplied), prose of the new episodes archived in `archive/episode-sources/kairos_119_128_import/`

## Reconciliation

- **Episodes 107-118** were compared word by word (ignoring accents, dashes, quotes and spacing) with `archive/episode-sources/kairos_107_114_import/` and `kairos_115_118_import/`. Episodes 107-114, 116 and 117 are identical. The only differences are PDF text-extraction artifacts: split words in the LCK/LPL table headers of Episode 115 ("posição jogador" broken in two, "jackeylov e") and "scrim s" in Episode 118. Nothing was re-imported or modified.
- **Episodes 119-128** are new. The PDF wraps lines, so the text was extracted and paragraphs were rejoined automatically; some long paragraphs are merged and table cells can run together, but no word was changed. Structured records: `data/episodes/episode-119.json` to `episode-128.json`; source `source-episodes-119-128`.

## Events registered

| Episode | Date | Content |
| --- | --- | --- |
| 119 | 2027-01-30 | Tarik's first full Academy Green day; four private CS scrims (Main 13-8 Nuke, 11-13 Train; Academy 11-13 Overpass, 13-10 Cobblestone); Arthur watches the Main; Zayn's private conversation with Maya Torres and Evelyn Park; Adrian starts studying supervised animal visits |
| 120 | 2027-01-31 | Day off for all 25 players: LA Galaxy 2-2 San Diego FC; Lakers 118-116 Suns; Nathan Hall's mid-court shot secures a USD 20,000 community technology donation |
| 121 | 2027-02-01 | Three private League Fearless MD3s: Main 2-1 Dignitas, Blue 1-2 Blue Otter, White 2-1 University of Mississippi |
| 122 | 2027-02-01 | Vincente's Palmeiras photo goes viral in Brazil; private CS: M80 2-0 Kairos Gaming, Academy Green 2-1 Chalkline; a video accidentally shows two Train setups |
| 123 | 2027-02-02 | Aphromoo gives up the formal support mentorship; Xpecial accepts the Support Mentor role |
| 124 | 2027-02-03 | Arthur Fletcher is hospitalised with a fever during chemotherapy; Owen unsure about Austin |
| 125 | 2027-02-04 | Expansion priorities (Street Fighter 6, Rocket League) and the sixth-player search; Main 2-0 Winthrop, White 2-1 Blue; IEM Dallas: Astralis 2-1 M80, FURIA 2-0 Liquid |
| 126 | 2027-02-05 | Owen decides to travel; six Academy Green players planned; Nathan's workshop invitation; ge.globo interviews Vincente (published 19:14); IEM Dallas: Vitality 2-0 Liquid, FURIA 2-1 MIBR, M80 2-0 BC.Game, paiN 2-1 Astralis |
| 127 | 2027-02-06 | CCT allows six registered players; Zayn registered as Kairos Gaming's reserve; Main 2-1 NRG, Blue 2-1 Dorado, White 0-2 Maryville; IEM Dallas: Legacy 2-1 FaZe, Falcons 2-0 NAVI, MOUZ 2-1 Spirit, Aurora 2-0 G2 |
| 128 | 2027-02-07 | The whole CS department flies to Austin in Adrian's jet; CCT draw and Group D schedule; IEM Dallas: MOUZ 2-0 G2; the eve of Kairos Gaming x Fluxo |

Current narrative date moved to **2027-02-07** (canon 0.34.0, current episode 128).

## IEM Dallas 2027 (in progress)

The groups of the existing draw match Episodes 125-128 exactly (A: Vitality, FURIA, Liquid, MIBR; B: Legacy, FaZe, Falcons, NAVI; C: M80, Astralis, paiN, BC.Game; D: MOUZ, Spirit, Aurora, G2). Eleven series are registered in `data/competitive-world-overrides/iem-dallas-invites-2027.json` with date and map scores. Where an episode gives the winner of a map but not the score (Vitality-Liquid Dust II, M80-Astralis Train and Nuke, paiN-Astralis Nuke, MOUZ-Spirit Train) the score is left empty, so the group table shows round totals only for teams whose played series are fully scored. Not narrated and therefore not registered: Vitality x MIBR and paiN x BC.Game (round 1, before 2027-02-05), every round-3 match, group-B and group-D matches after 2027-02-07, standings, qualification and the playoffs. The competition status is now `active`.

## CCT North America #1

Episode 128 shows the draw: it matches the overlay exactly (groups and Group D schedule); only the confirmation is added. New in the overlay: `registeredRosters` for Kairos Gaming — Atlas, Glacier, Mold, MoteConHuesillo and FLACOGOMEZ with p4rkingl0t (Zayn) as reserve, approved 2027-02-06. Rules: up to six registered players; substitution between series with approval, never during a started MD3. No CCT match has been played.

## Entities updated

- New records: 14 private scrim matches, source `source-episodes-119-128`, source `source-episode-126-ge-globo-interview`, publisher `ge-globo`, publication `entrevista-ge-globo-flacogomez` (see below).
- Xpecial (`alex-xpecial-chu`): first appearance Episode 123, joined 2027-02-02, staff tenure start date set; contract terms and first in-person day are not stated.
- Individual timelines extended for the 25 players, Luk, Trace, Tarik, Stewie2K, Aphromoo, Thinkcard, Hai, Sable, the four mentors, Emily, Marcus, Maya Torres, Evelyn Park and Arthur Fletcher; team confirmed facts for the five Kairos teams.
- Schema: `late-january-2027` and `early-february-2027` added to the story-period lists.
- Website: group tables and match rows show dates and map scores (`GroupMatch2027.date` and `maps`), round totals show a dash when not fully known, and the home page lists events under way with their latest results.

## ge.globo article

Episode 126 shows only the headline, the standfirst and a summary of the article. At the author's request the full Portuguese text was written for the Publications page strictly from the interview scene (10:51) and the facts of Episodes 122 and 126; every quotation comes from that scene. The episode labels the piece "Reportagem fictícia no universo Kairos"; at the author's request the label is not shown (the publisher uses the same hidden internal-provenance disclosure as Dust2.us and Riot Games); the byline is the outlet's staff because the journalist is unnamed.

## Continuity points for author review

1. **Palmeiras shirt colour.** Green in Episode 122 (viral photo), blue (Palmeiras 2026) in Episode 126 (interview). Both are kept as narrated; the article mentions the green shirt in the photo and the blue one in the interview.
2. **Where Vincente grew up.** Episode 122 says Tulsa and later California; the interview says Tulsa. The article says Tulsa.
3. **IEM Dallas start.** Episode 125 says the event began on 2027-02-03, yet FURIA x Liquid is called "the first match of Group A" on 2027-02-04 and groups B and D open on 2027-02-06. Dates are registered exactly as narrated; nothing is invented for 2027-02-03.
4. **Round 1 of groups A and C.** Episode 126 says paiN "won in the previous round" but never narrates the match; it is not registered.
5. **Stewie2K.** Listed with Without a Roof in CCT Group C; his dates remain as in Episode 117.
6. **Sixth player.** Episode 125 first imagines a sixth player for the main team; Episode 126 redirects the plan to six Academy Green players; Episode 127 registers Zayn only for the CCT. All three are recorded in order.
7. **Zayn's private conversation (Episode 119).** No diagnosis exists and none must be stated; the content is confidential and kept out of public pages.
8. **Arthur Fletcher's illness.** Hospitalised from 2027-02-03, stable, no discharge date; no medical detail beyond what the episodes state.
9. **Adrian's private jet (Episode 128)** is a new fact; he says it is not the standard for Kairos travel.
