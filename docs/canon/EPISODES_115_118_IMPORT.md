# Episodes 107-118 Import Report

**Canon status:** CONFIRMED
**Source:** `107-118.docx` (author-supplied), archived in `archive/episode-sources/kairos_115_118_import/`

## Reconciliation

- **Episodes 107-114** were compared word by word with `archive/episode-sources/kairos_107_114_import/`. The only differences are text-extraction artifacts (zero-width spaces, `&`). Nothing was re-imported or modified.
- **Episodes 115-118** are new: original Portuguese prose archived without edits, one paragraph per line (table cells one per line); structured records `data/episodes/episode-115.json` to `episode-118.json`; source `source-episodes-115-118`.

## Events registered

| Episode | Date | Content |
| --- | --- | --- |
| 115 | 2027-01-28 | LCK, LPL, CBLOL and LCP 2027 rosters presented (32 organizations, 160 starters); retirements 32 / 13 / 10 / 9; T1 without Faker |
| 116 | 2027-01-28 | Off-comfort champion work for Main, Academy Blue and Academy White; one recorded private exercise (Main loses) |
| 117 | 2027-01-28 | IEM Dallas invites (9:30 PT) and CCT North America #1 invites (17:31 PT); Kairos Gaming invited to the CCT; Stewie2K leaving for Without a Roof; Tarik appointed Head Coach of Kairos Academy Green |
| 118 | 2027-01-29 | Five off-pool champions per League player; five private scrims per team: Main 3-2, Blue 2-3, White 1-4 |

Existing datasets reused without duplication: the LCK, LPL, CBLOL and LCP roster overlays (all 24 team lineups and the retirement counts match the episode prose exactly), the NACL overlay (NRG Top Sniper, Winthrop ADC Cody Sun), and the IEM Dallas and CCT invite overlays (both 16-team lists match). Only the announcement date `2027-01-28` was added to the two events.

## Private scrims

Registered as `private-scrim` practice, `affectsStandings: false`: `match-lol-external-main-independent-exercise-2027-01-28`, `match-lol-external-main-independent-5-games-2027-01-29`, `match-lol-external-academy-blue-independent-5-games-2027-01-29`, `match-lol-external-academy-white-independent-5-games-2027-01-29`. Games not individually narrated are marked, and games derived from a narrated total are labelled `derived-from-narrated-total`.

## Entities updated

- New: coach `tarik-kairos-cs-academy-head-coach` and staff tenure (Head Coach, Kairos Academy Green, 2027-01-28). No contract term, salary or administrative date is stated; real name is `TBD`.
- Stewie2K: coach record and tenure kept (no end date invented); Episode 117 timeline added.
- Trace (Development Coach), Luk (Head Coach of Kairos Gaming), the League staff and mentors (Aphromoo, Thinkcard, Hai, Sable, Darshan, Xmithie, Goldenglue, WildTurtle), Emily Chen, the 15 League players and the 10 Counter-Strike players: individual timelines extended.
- Teams: Kairos Gaming (Counter-Strike) and Academy Green coaching staff and facts; the three League teams record the private scrim results.

## Continuity conflicts for author review

1. **Stewie2K's departure date and Tarik.** The earlier `jake-stewie2k-yip` record placed Without a Roof's offer, his acceptance and Tarik's candidacy in "Episode 118 (2027-01-29)" and said Tarik had not accepted. The author's Episode 117 (2027-01-28) has Stewie telling the Academy at 13:16 and Tarik accepting at 19:12; Episode 118 has no Counter-Strike events. The record's metadata was updated to Episode 117 and a retcon note was added; the exact date of Stewie's acceptance is not stated (it precedes 11:08 on 2027-01-28).
2. **Time zones in Episode 115.** The LCK reveal starts at 8:58 KST on 2027-01-28, which is the afternoon of 2027-01-27 in Los Angeles, yet Los Angeles reacts at 12:34 PT on 2027-01-28 as if the rosters had been announced "that morning", and Episode 116 has the players discussing the T1 video at 8:17 PT the same day.
3. **Announcement order on 2027-01-28.** Emily says at 11:08 that Tarik is interested and that the CCT list is due in the late afternoon; Stewie tells the Academy at 13:16 that he is leaving; the Without a Roof roster appears on the CCT list at 18:09. Consistent, but Stewie's acceptance date and the formal departure date remain unstated.
4. **Without a Roof on the CCT list.** The lineup (autimatic, Stewie2K, Brehze, CeRq, FaNg) is consistent with the frozen external Counter-Strike rosters; no change to the freeze rules was made.
