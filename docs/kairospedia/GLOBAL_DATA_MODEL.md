# Global Data Model

## Core identity rules

- Stable IDs and canonical slugs use lowercase kebab-case.
- Relevant records belong to continuity `kairos-universe`.
- Origin type is controlled as `fictional` or `real-world-reference`.
- One person keeps one stable identity across player, coach, staff, executive,
  and mentor functions.
- Historical and retconned aliases never replace a current canonical nickname.

## Entity classes

### Organizations

An organization is a parent business or esports brand. It is distinct from
every team it operates.

The publication view supports identity, origin, continuity, status,
headquarters, teams, sources, and canon status. Unknown founding, closure,
website, social, and asset fields remain unknown.

### Teams

A team is a game-specific competitive unit. One organization may operate many
teams in multiple games and roster levels.

Current membership is resolved from roster tenures, not only from a mutable
player team field.

### People

Character, player, coach, staff, executive, and mentor records remain
interoperable through stable IDs. Role changes are represented by tenures or
events instead of duplicate people.

### Tenures

Roster tenures record player membership, game, team, role, status, captaincy,
starter state, dates, sources, and canon status.

Staff tenures record person, organization, optional team scope, division,
title, responsibilities, dates, status, sources, and canon status.

### Transfers

Transfer events support permanent transfers, free-agent signings, releases,
loans, loan returns, promotions, demotions, benching, activation, retirement,
role transitions, and staff appointments.

No Kairos League transfer event exists in this release.

### Competition hierarchy

The model supports competition, season, split, stage, group, round, series,
standing, and qualification path. Empty indexes are intentional until canon
supports records.

### Match hierarchy

Match type and official status are separate.

- Official match.
- Showmatch.
- Private or public scrim.
- Evaluation match.
- Internal scrim.
- Practice block.

League games and Counter-Strike maps use separate child records. Every match
lineup preserves the people who participated at that time.

### Statistics

Statistics require a specific context:

- Match.
- Game or map.
- Season.
- Competition.
- Team tenure.
- Career.

Official, private, training, and projected statistics cannot share a context.
No official Kairos League statistics exist.

### Sources

The source registry supports episodes, normalized sources, canon documents,
structured records, real-world references, announcements, interviews, private
records, and version metadata.

Public pages show readable source labels rather than internal filesystem
details.
