import type { RosterEntryView, SourceView, TeamView } from "@/types/catalog";
import type { ExternalScene, SceneTeam } from "@/types/external-scene";
import type { LcsRosters2027, WorldState2027 } from "@/types/world-state-2027";
import { nationalitiesOf, regionCodeOfLeague } from "@/lib/external/worldState2027";

const marketLabel = (sets: LcsRosters2027[], playerId: string) => {
  const region = sets.flatMap((set) => set.marketAvailability ?? []).find((entry) => entry.playerId === playerId)?.eligibleRegion ?? "";
  return ({ KR: "Korean", CN: "Chinese" } as Record<string, string>)[region] ?? region;
};

export function sceneTeamToTeamView(team: SceneTeam, scene: ExternalScene, rosters2027?: LcsRosters2027 | LcsRosters2027[], worldState?: WorldState2027): TeamView {
  const sets = rosters2027 ? (Array.isArray(rosters2027) ? rosters2027 : [rosters2027]) : [];
  const organization = scene.organizations.find((o) => o.id === team.organizationId)!;
  const event = scene.sources.find((s) => team.sourceIds.includes(s.id))!;

  const roster: RosterEntryView[] = team.rosterTenureIds.map((tenureId) => {
    const tenure = scene.rosterTenures.find((t) => t.id === tenureId)!;
    const player = scene.players.find((p) => p.id === tenure.playerId)!;
    const nationalities = nationalitiesOf(worldState, player.id, team.league);
    return {
      nationality: nationalities[0] ?? null,
      nationalities,
      regionCode: regionCodeOfLeague(worldState, team.league),
      tenureId: tenure.id,
      playerId: player.id,
      slug: player.slug,
      realName: "TBD",
      nickname: player.nickname,
      role: tenure.role,
      rosterStatus: "active",
      isCaptain: false,
      isStarter: tenure.designation === "main",
      joinedDate: null,
      leftDate: null,
      contractEndDate: null,
      teamId: team.id,
      teamName: team.name,
      teamSlug: team.slug,
    };
  });

  const sources: SourceView[] = scene.sources.filter((s) => team.sourceIds.includes(s.id)).map((s) => ({
    id: s.id, label: s.title, type: "Indexed tournament page", canonStatus: "unconfirmed", originType: "real-world-reference",
  }));

  const lineupSet = sets.find((set) => set.teams.some((entry) => entry.teamId === team.id));
  const roster2027 = lineupSet?.teams.find((entry) => entry.teamId === team.id);
  const starterIds = new Set(roster2027?.starters.map((starter) => starter.playerId));
  const addedPlayers = new Map(sets.flatMap((set) => set.addedPlayers).map((player) => [player.playerId, player]));
  const starters2027: RosterEntryView[] = (roster2027?.starters ?? []).map((starter) => {
    const added = addedPlayers.get(starter.playerId);
    const scenePlayer = scene.players.find((p) => p.id === starter.playerId);
    const nationalities = nationalitiesOf(worldState, starter.playerId, team.league, added?.nationality);
    return {
      nationality: nationalities[0] ?? null,
      nationalities,
      regionCode: regionCodeOfLeague(worldState, team.league),
      tenureId: `${team.id}-${starter.playerId}-2027`,
      playerId: starter.playerId,
      slug: added?.slug ?? scenePlayer!.slug,
      realName: added?.legalName ?? "TBD",
      nickname: starter.nickname === "KyRa" ? "KryRa" : (scenePlayer?.nickname ?? starter.nickname),
      role: starter.role,
      rosterStatus: "active",
      isCaptain: false,
      isStarter: true,
      joinedDate: null,
      leftDate: null,
      contractEndDate: null,
      teamId: team.id,
      teamName: team.name,
      teamSlug: team.slug,
    };
  });
  const departures = sets.flatMap((set) => set.departures.filter((entry) => entry.teamId === team.id).map((entry) => ({ entry, date: set.confirmedBy })));
  const departedIds = new Set(departures.map(({ entry }) => entry.playerId));
  const activeRoster = roster2027 ? starters2027 : roster.filter((entry) => !departedIds.has(entry.playerId));
  const formerRoster = roster2027 ? roster.filter((entry) => !starterIds.has(entry.playerId)) : roster.filter((entry) => departedIds.has(entry.playerId));
  const departureText = (entry: (typeof departures)[number]["entry"]) => entry.reason === "retired" ? `${entry.nickname} is confirmed retired for 2027.`
    : entry.reason === "available-for-market" ? `${entry.nickname} is available for the ${marketLabel(sets, entry.playerId)} market for 2027.`
    : `${entry.nickname} is confirmed with ${entry.destinationTeamName} for 2027.`;
  const departureEntries = departures.map(({ entry, date }) => ({ id: `${team.id}-2027-${entry.playerId}`, date, text: departureText(entry) }));
  const pendingEntries = sets.flatMap((set) => (set.pendingIdentities ?? []).filter((entry) => entry.teamId === team.id));
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    shortName: team.name,
    organizationId: organization.id,
    gameId: team.gameId,
    gameName: "League of Legends",
    divisionId: team.league,
    rosterLevel: team.league,
    status: "active",
    competitiveState: "Real-world reference",
    intendedCompetition: team.league,
    currentStoryPeriod: "Pre-Worlds 2026",
    officialDebutPeriod: "Unknown",
    captainPlayerId: "",
    headCoachName: null,
    headCoachSlug: null,
    trainingLocation: { city: "TBD", region: "TBD", country: "TBD" },
    roster: activeRoster,
    formerRoster,
    officialMatchCount: 0,
    history: [],
    timeline: [],
    staff: [],
    assignedStaffIds: [],
    mentors: [],
    formerStaff: [],
    formerStaffIds: [],
    transactions: [
      { id: `${team.id}-observed`, date: event.eventEndDate, text: `Roster observed at ${event.title}.` },
      ...(roster2027 ? [{ id: `${team.id}-2027-lineup`, date: lineupSet!.confirmedBy, text: "2027 starting lineup confirmed." }] : []),
      ...departureEntries,
      ...pendingEntries.map((entry) => ({ id: `${team.id}-2027-pending-${entry.role}`, date: lineupSet?.confirmedBy ?? null, text: `${entry.nickname} is the author-confirmed 2027 ${entry.role}; player identity profile pending author approval.` })),
    ],
    relatedEpisodes: [],
    sources,
    achievements: [],
    statistics: {},
  };
}

export function sceneTeamOrganizationLite(team: SceneTeam, scene: ExternalScene) {
  const organization = scene.organizations.find((o) => o.id === team.organizationId)!;
  return {
    id: organization.id,
    slug: organization.slug,
    name: organization.name,
    headquarters: null,
    ownerName: null,
    ownerSlug: null,
    founded: null,
    management: [],
  };
}

export function tier2TeamToTeamView(team: { teamId: string; name: string; ecosystem: string }, roster: RosterEntryView[], organizationId: string): TeamView {
  return {
    id: team.teamId,
    slug: team.teamId,
    name: team.name,
    shortName: team.name,
    organizationId,
    gameId: "game-league-of-legends",
    gameName: "League of Legends",
    divisionId: team.ecosystem,
    rosterLevel: team.ecosystem,
    status: "active",
    competitiveState: "Real-world reference",
    intendedCompetition: team.ecosystem,
    currentStoryPeriod: "2027",
    officialDebutPeriod: "Unknown",
    captainPlayerId: "",
    headCoachName: null,
    headCoachSlug: null,
    trainingLocation: { city: "TBD", region: "TBD", country: "TBD" },
    roster,
    formerRoster: [],
    officialMatchCount: 0,
    history: [],
    timeline: [],
    staff: [],
    assignedStaffIds: [],
    mentors: [],
    formerStaff: [],
    formerStaffIds: [],
    transactions: roster.length ? [{ id: `${team.teamId}-2027-lineup`, date: null, text: "2027 starting lineup confirmed." }] : [],
    relatedEpisodes: [],
    sources: [],
    achievements: [],
    statistics: {},
  };
}
