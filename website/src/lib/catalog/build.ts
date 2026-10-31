import type {
  RawEpisode,
  RawOrganization,
  RawPlayer,
  RawStaff,
  RawTeam,
  RawAward,
  RosterTenure,
  SourceRecord,
  StaffTenure,
} from "@/types/canon";
import type {
  EpisodeView,
  GameView,
  KairospediaCatalog,
  MentorView,
  OrganizationView,
  PlayerView,
  PublicationManifest,
  RosterEntryView,
  SourceView,
  StaffEntryView,
  StaffView,
  TeamView,
} from "@/types/catalog";
import { calculateAge } from "@/lib/canon/age";
import { byId, getCollection } from "@/lib/canon/loader";
import {
  getActiveRoster,
  getPlayerTeamHistory,
  getTeamStaffAtDate,
} from "@/lib/canon/tenures";
import { validateCanonUniverse } from "@/lib/validation/canon";
import { buildCompetitionViews } from "./competitions";

import type { CanonUniverse } from "@/types/canon";

const gameIdByName: Record<string, string> = {
  "League of Legends": "game-league-of-legends",
  "Counter-Strike": "game-counter-strike",
};

const roleOrderByGame: Record<string, string[]> = {
  "League of Legends": ["Top", "Jungle", "Mid", "ADC", "Support"],
};

export function buildCatalog(
  universe: CanonUniverse,
  publication: PublicationManifest,
): KairospediaCatalog {
  validateCanonUniverse(universe, publication);

  const organizations = byId(
    getCollection<RawOrganization>(universe, "organizations"),
  );
  const teams = byId(getCollection<RawTeam>(universe, "teams"));
  const players = byId(getCollection<RawPlayer>(universe, "players"));
  const staff = byId(getCollection<RawStaff>(universe, "coaches"));
  const episodes = getCollection<RawEpisode>(universe, "episodes");
  const rosterTenures = getCollection<RosterTenure>(
    universe,
    "roster-tenures",
  );
  const staffTenures = getCollection<StaffTenure>(universe, "staff-tenures");
  const sources = byId(getCollection<SourceRecord>(universe, "sources"));
  const narrativeDate = universe.version.currentNarrativeDate;
  const officialMatches = (universe.collections.matches ?? []).filter((match) =>
    match.officialStatus === "official" && publication.enabledMatches.includes(String(match.id)));
  const lineups = universe.collections.lineups ?? [];

  const episodeView = (episode: RawEpisode): EpisodeView => ({
    id: episode.id,
    number: episode.episodeNumber,
    title:
      episode.title ??
      episode.historicalTitle ??
      `Episode ${episode.episodeNumber}`,
    date: episode.exactStoryDate,
    summary: episode.teams.some(
      (teamId) => !publication.enabledTeams.includes(teamId),
    )
      ? "This episode includes a team update. Its full summary also covers teams outside the current publication."
      : episode.summary,
  });

  const sourceViews = (sourceIds: string[]): SourceView[] =>
    [...new Set(sourceIds)]
      .map((id) => sources.get(id))
      .filter((source): source is SourceRecord => Boolean(source))
      .map((source) => ({
        id: source.id,
        label: source.publicLabel,
        type: source.sourceType,
        canonStatus: source.canonStatus,
        originType: source.originType,
      }));

  const enabledTeamRecords = publication.enabledTeams.map((id) => {
    const team = teams.get(id);
    if (!team) throw new Error(`Published team missing: ${id}`);
    return team;
  });

  const rosterEntry = (
    tenure: RosterTenure,
    player: RawPlayer,
  ): RosterEntryView => ({
    tenureId: tenure.id,
    playerId: player.id,
    slug: player.slug,
    realName: player.realName,
    nickname: player.nickname,
    nationality: unknownToNull(player.nationality),
    nationalities: player.nationalities,
    role: String((universe.shared.roles ?? []).find((role) => role.id === tenure.roleId)?.name ?? "Unknown"),
    rosterStatus: tenure.rosterStatus,
    isCaptain: tenure.isCaptain,
    isStarter: tenure.isStarter,
    joinedDate: exactOrNull(tenure.effectiveDate ?? tenure.joinedDate),
    leftDate: exactOrNull(tenure.leftDate),
    contractEndDate: exactOrNull(
      typeof player.contract === "object" && player.contract && "endDate" in player.contract
        ? String((player.contract as Record<string, unknown>).endDate ?? "")
        : null,
    ),
    teamId: tenure.teamId,
    teamName: publication.enabledTeams.includes(tenure.teamId)
      ? teams.get(tenure.teamId)?.name ?? "Unknown" : "Unpublished team",
    teamSlug: publication.enabledTeams.includes(tenure.teamId)
      ? teams.get(tenure.teamId)?.slug ?? null : null,
  });

  const staffEntry = (
    tenure: StaffTenure,
    person: RawStaff,
  ): StaffEntryView => ({
    tenureId: tenure.id,
    staffId: person.id,
    slug: person.slug,
    realName: person.realName,
    nickname: person.nickname === "TBD" ? null : person.nickname,
    nationality: unknownToNull(person.nationality),
    title: tenure.title,
    status: tenure.status,
    teamScope: tenure.teamId === "TBD" ? null : tenure.teamId,
  });

  const mentorForPlayer = (player: RawPlayer): MentorView | null => {
    const relationship = player.relationships.find(
      (entry) => entry.type === "role-mentor" && entry.status === "confirmed",
    );
    if (!relationship) return null;
    const mentor = staff.get(relationship.subjectId);
    if (!mentor) return null;
    return {
      id: mentor.id,
      name: mentor.realName,
      nickname: mentor.nickname === "TBD" ? null : mentor.nickname,
      role: mentor.role,
      playerId: player.id,
      playerName: player.realName,
      realWorldFigure: mentor.realWorldFigure,
    };
  };

  const teamViews: TeamView[] = enabledTeamRecords.map((team) => {
    const activeTenures = getActiveRoster(rosterTenures, team.id, narrativeDate);
    const teamRoster = activeTenures
      .map((tenure) => {
        const player = players.get(tenure.playerId);
        if (!player) throw new Error(`Roster player missing: ${tenure.playerId}`);
        return rosterEntry(tenure, player);
      })
      .sort(
        (a, b) => {
          const order = roleOrderByGame[team.game];
          return order ? order.indexOf(a.role) - order.indexOf(b.role) : 0;
        },
      );

    const divisionId = String((universe.shared.divisions ?? []).find(
      (division) => division.name === team.game,
    )?.id ?? "TBD");
    const teamStaff = getTeamStaffAtDate(
      staffTenures,
      team.id,
      divisionId,
      narrativeDate,
    )
      .filter((tenure) => publication.enabledStaff.includes(tenure.personId))
      .map((tenure) => {
        const person = staff.get(tenure.personId);
        if (!person) throw new Error(`Staff record missing: ${tenure.personId}`);
        return staffEntry(tenure, person);
      });

    const mentors = teamRoster
      .map((entry) => players.get(entry.playerId))
      .filter((player): player is RawPlayer => Boolean(player))
      .map(mentorForPlayer)
      .filter((mentor): mentor is MentorView => Boolean(mentor));

    const relatedEpisodes = episodes
      .filter((episode) => episode.teams.includes(team.id))
      .sort((a, b) => b.episodeNumber - a.episodeNumber)
      .slice(0, 12)
      .map(episodeView);

    return {
      id: team.id,
      slug: team.slug,
      name: team.name,
      shortName: team.shortName,
      organizationId: team.organization.id,
      gameId: gameIdByName[team.game] ?? "TBD",
      gameName: team.game,
      divisionId,
      rosterLevel: team.level,
      status: team.status,
      competitiveState: team.status.replaceAll("-", " "),
      intendedCompetition: team.intendedCompetition,
      currentStoryPeriod: team.currentStoryPeriod.displayName,
      officialDebutPeriod: `${team.officialDebutPeriod.month} ${team.officialDebutPeriod.exactYear}`,
      captainPlayerId: team.captain as string,
      trainingLocation: team.trainingLocation,
      roster: teamRoster,
      officialMatchCount: officialMatches.filter((match) => match.teamAId === team.id || match.teamBId === team.id).length,
      formerRoster: rosterTenures.filter((tenure) =>
        tenure.teamId === team.id && tenure.canonStatus === "confirmed" &&
        tenure.leftDate && tenure.leftDate !== "TBD" && tenure.leftDate < narrativeDate &&
        publication.enabledPlayers.includes(tenure.playerId),
      ).map((tenure) => rosterEntry(tenure, players.get(tenure.playerId)!)),
      history: team.confirmedFacts.filter((fact) =>
        !/born |age \d|current narrative date/i.test(fact)),
      timeline: episodes.filter((episode) => episode.canonStatus === "confirmed" && episode.teams.includes(team.id))
        .sort((a, b) => a.episodeNumber - b.episodeNumber).map(episodeView),
      staff: teamStaff,
      mentors,
      relatedEpisodes,
      sources: sourceViews([
        ...rosterTenures.filter((tenure) => tenure.teamId === team.id).flatMap((tenure) => tenure.sourceIds),
        ...staffTenures.filter((tenure) => tenure.teamId === team.id || tenure.divisionId === divisionId).flatMap((tenure) => tenure.sourceIds),
        "source-kairos-version",
      ]),
      achievements: team.achievements,
      statistics: team.statistics,
    };
  });

  const teamViewById = byId(teamViews);

  const playerViews: PlayerView[] = publication.enabledPlayers.map((id) => {
    const player = players.get(id);
    if (!player) throw new Error(`Published player missing: ${id}`);
    const currentTeam = teamViewById.get(player.currentTeam as string);
    if (!currentTeam) {
      throw new Error(`Player ${id} references an unpublished current team.`);
    }
    const appearances = episodes
      .filter((episode) => episode.characters.includes(player.id))
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map(episodeView);
    const first = episodes.find((episode) => episode.id === player.firstAppearance);
    const history = getPlayerTeamHistory(rosterTenures, player.id).filter(
      (tenure) => publication.enabledTeams.includes(tenure.teamId),
    ).map(
      (tenure) => rosterEntry(tenure, player),
    );
    const sourceIds = history.flatMap((tenure) => {
      const raw = rosterTenures.find((record) => record.id === tenure.tenureId);
      return raw?.sourceIds ?? [];
    });

    return {
      id: player.id,
      slug: player.slug,
      realName: player.realName,
      nickname: player.nickname,
      displayName: `${player.realName} “${player.nickname}”`,
      nationality: unknownToNull(player.nationality),
      nationalities: player.nationalities,
      city: unknownToNull(player.city),
      cityRegion: unknownToNull(player.homeTown?.region ?? player.currentResidence?.region ?? null),
      dateOfBirth: exactOrNull(player.dateOfBirth),
      age: calculateAge(player.dateOfBirth, narrativeDate),
      gameId: gameIdByName[player.game] ?? "TBD",
      gameName: player.game,
      role: player.role,
      currentTeamId: currentTeam.id,
      currentTeamName: currentTeam.name,
      status: player.status,
      isCaptain: player.isCaptain === true,
      firstAppearance: first ? episodeView(first) : null,
      episodeAppearances: appearances,
      historicalAliases: player.historicalAliases,
      teamHistory: history,
      trivia: (player.trivia ?? []).filter((fact) => fact !== "TBD"),
      awards: getCollection<RawAward>(universe, "awards")
        .filter((award) => award.recipientId === player.id && award.canonStatus === "confirmed" &&
          (!award.competitionId || award.competitionId === "TBD" || publication.enabledCompetitions.includes(award.competitionId)))
        .map((award) => ({
          id: award.id, name: award.name, date: exactOrNull(award.date),
          recipientName: player.nickname, recipientHref: `/wiki/players/${player.slug}`,
          competitionName: null, sources: sourceViews(award.sourceIds),
        })),
      tournamentResults: [],
      officialMatchCount: officialMatches.filter((match) => lineups.some((lineup) =>
        lineup.matchId === match.id && Array.isArray(lineup.playerIds) && lineup.playerIds.includes(player.id))).length,
      mentor: mentorForPlayer(player),
      statistics: player.statistics,
      sources: sourceViews([...sourceIds, "source-kairos-version"]),
      canonNotes: player.canonNotes,
    };
  });

  const staffViews: StaffView[] = publication.enabledStaff.map((id) => {
    const person = staff.get(id);
    if (!person) throw new Error(`Published staff member missing: ${id}`);
    const appearances = episodes
      .filter((episode) => episode.characters.includes(person.id))
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map(episodeView);
    const first = episodes.find((episode) => episode.id === person.firstAppearance);
    const tenures = staffTenures
      .filter((tenure) => tenure.personId === person.id)
      .map((tenure) => staffEntry(tenure, person));
    const sourceIds = staffTenures
      .filter((tenure) => tenure.personId === person.id)
      .flatMap((tenure) => tenure.sourceIds);

    return {
      id: person.id,
      slug: person.slug,
      realName: person.realName,
      nickname: unknownToNull(person.nickname),
      displayName:
        person.nickname === "TBD"
          ? person.realName
          : `${person.realName} “${person.nickname}”`,
      nationality: unknownToNull(person.nationality),
      role: person.role,
      division: person.division,
      currentOrganizationId: person.currentOrganization,
      currentTeamId: person.currentTeam === "TBD" ? null : person.currentTeam,
      status: person.status,
      firstAppearance: first ? episodeView(first) : null,
      episodeAppearances: appearances,
      realWorldFigure: person.realWorldFigure,
      responsibilities: person.responsibilities.filter(
        (responsibility) =>
          !/academy/i.test(
            responsibility,
          ),
      ),
      tenures,
      sources: sourceViews(sourceIds),
      canonNotes: person.canonNotes,
    };
  });

  const organizationViews: OrganizationView[] =
    publication.enabledOrganizations.map((id) => {
      const organization = organizations.get(id);
      if (!organization) throw new Error(`Published organization missing: ${id}`);
      return {
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        shortName: organization.name.replace(/\s+Esports$/, ""),
        originType: "fictional",
        continuityId: "kairos-universe",
        status: organization.status,
        headquarters: organization.headquarters ?? null,
        teamIds: teamViews
          .filter((team) => team.organizationId === organization.id)
          .map((team) => team.id),
        philosophy: organization.philosophy ?? [],
        longTermGoals: organization.longTermGoals ?? [],
        sources: sourceViews([
          "source-organization-kairos-esports",
          "source-kairos-version",
        ]),
      };
    });

  const leagueEpisodes = episodes
    .filter(
      (episode) =>
        episode.teams.some((id) => publication.enabledTeams.includes(id)) ||
        episode.characters.some(
          (id) =>
            publication.enabledPlayers.includes(id) ||
            publication.enabledStaff.includes(id),
        ),
    )
    .sort((a, b) => b.episodeNumber - a.episodeNumber)
    .slice(0, 6)
    .map(episodeView);

  const gameViews: GameView[] = publication.enabledGames.map((id) => {
    const sharedGame = (universe.shared.games ?? []).find(
      (game) => game.id === id,
    );
    if (!sharedGame) throw new Error(`Published game missing: ${id}`);
    const name = sharedGame.name as string;
    return {
      id,
      slug: name.toLowerCase().replaceAll(" ", "-"),
      name,
      roleVocabulary: [
        ...new Set(
          playerViews
            .filter((player) => player.gameId === id)
            .map((player) => player.role),
        ),
      ],
      activeTeamIds: teamViews
        .filter((team) => team.gameId === id)
        .map((team) => team.id),
      activePlayerIds: playerViews
        .filter((player) => player.gameId === id)
        .map((player) => player.id),
      latestEpisodes: leagueEpisodes,
    };
  });

  const competitionViews = buildCompetitionViews(universe, publication, teamViews, playerViews, sourceViews);
  for (const player of playerViews) {
    // Only match-specific lineups establish participation, never the current roster.
    for (const competition of competitionViews) {
      const playedTeamIds = new Set(lineups.filter((lineup) =>
        Array.isArray(lineup.playerIds) && lineup.playerIds.includes(player.id) &&
        officialMatches.some((match) => match.id === lineup.matchId && match.competitionId === competition.id),
      ).map((lineup) => lineup.teamId));
      player.tournamentResults.push(...competition.results.filter((result) =>
        teamViews.some((team) => team.slug === result.teamSlug && playedTeamIds.has(team.id))));
      for (const award of player.awards) {
        if (competition.awards.some((entry) => entry.id === award.id)) award.competitionName = competition.name;
      }
    }
  }

  const routes = [
    "/wiki",
    "/wiki/about",
    "/wiki/search",
    "/wiki/games",
    "/wiki/organizations",
    "/wiki/teams",
    "/wiki/players",
    "/wiki/staff",
    "/wiki/competitions",
    "/wiki/matches",
    "/wiki/transfers",
    ...gameViews.map((game) => `/wiki/games/${game.slug}`),
    ...organizationViews.map(
      (organization) => `/wiki/organizations/${organization.slug}`,
    ),
    ...teamViews.map((team) => `/wiki/teams/${team.slug}`),
    ...playerViews.map((player) => `/wiki/players/${player.slug}`),
    ...staffViews.map((person) => `/wiki/staff/${person.slug}`),
    ...competitionViews.map((competition) => `/wiki/competitions/${competition.slug}`),
  ];

  return {
    metadata: {
      canonVersion: universe.version.canonVersion,
      storyEpisode: universe.version.storyEpisode,
      storyPeriod: universe.version.storyPeriod,
      storyYear: universe.version.storyYear,
      currentNarrativeDate: narrativeDate,
      nextCompetitiveMilestone:
        universe.version.nextCompetitiveMilestone.displayName,
      generatedAt: new Date().toISOString(),
      publicationScope: "Kairos eSports",
    },
    games: gameViews,
    organizations: organizationViews,
    teams: teamViews,
    players: playerViews,
    staff: staffViews,
    competitions: competitionViews,
    matches: [],
    transfers: [],
    routes: [...new Set(routes)].sort((a, b) => a.localeCompare(b)),
  };
}

function exactOrNull(value: string | null): string | null {
  return value && value !== "TBD" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : null;
}

function unknownToNull(value: string | null): string | null {
  return value && value !== "TBD" ? value : null;
}
