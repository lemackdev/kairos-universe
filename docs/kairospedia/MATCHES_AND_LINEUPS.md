# Matches and Lineups

## Match classifications

Kairospedia separates:

- Official match.
- Showmatch.
- Private scrim.
- Public scrim.
- Evaluation match.
- Internal scrim.
- Practice block.

Visibility (`public`, `private`, or `internal`) and official status
(`official`, `unofficial`, or `practice`) are independent fields.

Private practice must never enter official records, standings, rankings,
achievements, or career statistics.

## Historical lineups

Every match stores team-specific lineup records containing:

- Participating players.
- Substitutes.
- Coaches.
- Captain.
- Role assignments.
- Sources.

A match page reads these records. It must never show a current roster as if it
were the historical lineup.

## League of Legends games

Game records support game number, winner, duration, patch, blue and red teams,
side selection, draft, picks, bans, player statistics, team statistics, and
sources.

## Counter-Strike maps

Map records support map name and order, team and halftime scores, overtime,
starting sides, player statistics, and sources.

Unsupported fields remain unknown. No match, game, map, lineup, or statistic
record is populated for Kairos League in this release.

## Draft command

```powershell
npm run entity:new-match -- --id example-match --source source-id
```
