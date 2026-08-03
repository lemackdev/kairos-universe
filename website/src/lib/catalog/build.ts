import type {
  RawEpisode,
  RawOrganization,
  RawPlayer,
  RawStaff,
  RawTeam,
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

import type { CanonUniverse } from "@/types/canon";

const gameIdByName: Record<string, string> = {
  "League of Legends": "game-league-of-legends",
  "Counter-Strike": "game-counter-strike",
};

const roleOrder = ["Top", "Jungle", "Mid", "ADC", "Support"];

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
      ? "This episode contains a canonical update relevant to the published League record. Other teams in the episode remain outside this release."
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
    role: player.role,
    rosterStatus: tenure.rosterStatus,
    isCaptain: tenure.isCaptain,
    isStarter: tenure.isStarter,
    joinedDate: exactOrNull(tenure.effectiveDate ?? tenure.joinedDate),
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
        (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
      );

    const divisionId = "division-league-of-legends";
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
      competitiveState: "Training and pre-debut",
      intendedCompetition: team.intendedCompetition,
      currentStoryPeriod: team.currentStoryPeriod.displayName,
      officialDebutPeriod: `${team.officialDebutPeriod.month} ${team.officialDebutPeriod.exactYear}`,
      captainPlayerId: team.captain as string,
      trainingLocation: team.trainingLocation,
      roster: teamRoster,
      staff: teamStaff,
      mentors,
      relatedEpisodes,
      sources: sourceViews([
        "source-team-kairos-lol-main",
        "source-document-league-staff",
        "source-document-league-mentors",
        "source-document-league-relationships",
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
    const history = getPlayerTeamHistory(rosterTenures, player.id).map(
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
      city: unknownToNull(player.city),
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
          !/(counter-strike|academy|dust2|visa|scouting|player visits)/i.test(
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
      publicationScope: "Kairos League of Legends main team",
    },
    games: gameViews,
    organizations: organizationViews,
    teams: teamViews,
    players: playerViews,
    staff: staffViews,
    competitions: [],
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
