# Encyclopedia Article Templates

Kairospedia uses shared, responsive article components for League of Legends
and Counter-Strike. Layouts follow the supplied encyclopedia references with
compact section navigation, grouped infoboxes, dense tables, a contents list,
and system light/dark themes. Kairospedia retains its own name and assets.

## Team pages

History, Team Information, Timeline, Player Roster, Former, Organization,
and Sources. History reads confirmed team facts. Timeline reads confirmed
episode metadata in episode order, without assigning missing dates. Former
players come from confirmed ended tenures, never from the current roster.
Staff and mentorship remain separate.

## Player pages

Overview, Background Information, Team History, Trivia, Individual Awards,
Tournament Results, and Sources. Trivia reads the canonical trivia field.
Awards read confirmed award records. Age uses the narrative date.
Team history resolves the team and role of each tenure, not the player's
current role. Tournament participation requires a published official match
lineup containing that player; current membership does not prove participation.

## Tournament pages

The existing competitions collection and /wiki/competitions/[slug] routes
provide Overview, Tournament Information, Prize Pool, Participants, Results,
MVPs, and Sources. No duplicate tournaments collection is introduced.

The competition schema supports optional overview, format, organizer,
location, startDate, endDate, prizePool, participantTeamIds, and
prizeDistribution. Missing values remain null, TBD, or absent. Existing
records remain valid.

Results come from confirmed standings. MVPs and other awards come from
confirmed award records. Prize amounts retain their sourced currency text;
no conversion, split, placement, or winner is inferred.

## Publishing a tournament

1. Create the source-backed competition and register it in the existing index.
2. Add confirmed participants and optional sourced tournament information.
3. Register standings and awards with their sources when available.
4. Enable the competition in website/kairospedia-publication.json.
5. Ensure its game, participants, and award recipients are also published.
6. Run npm run validate from website.

The catalog rejects unconfirmed tournaments, hidden participants and award
recipients, mismatched games, and reversed dates. Only published competitions
produce links, search entries, or detail pages.

## Current scope

The manifest still publishes Kairos League main and its five players.
There are no published tournament records, prize pools, results, or MVPs.
The tournament directory explains the empty state. Test-only tournament and
Counter-Strike fixtures exercise the templates without creating canon.

Adding Counter-Strike content requires canonical records, roster/staff tenures,
sources, and a deliberate publication update. The shared article templates
do not assume League roles, maps, champions, or statistics.

## Checks

The article tests cover section anchors, canonical ages, unknown values,
former rosters, tournament publication constraints, and both games.
Run npm run validate for the complete repository/site checks.
