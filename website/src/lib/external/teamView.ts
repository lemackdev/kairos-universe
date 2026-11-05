import type { RosterEntryView, SourceView, TeamView } from "@/types/catalog";
import type { ExternalScene, SceneTeam } from "@/types/external-scene";
import type { LcsRosters2027 } from "@/types/world-state-2027";

export function sceneTeamToTeamView(team: SceneTeam, scene: ExternalScene, lcs2027?: LcsRosters2027): TeamView {
  const organization = scene.organizations.find((o) => o.id === team.organizationId)!;
  const event = scene.sources.find((s) => team.sourceIds.includes(s.id))!;

  const roster: RosterEntryView[] = team.rosterTenureIds.map((tenureId) => {
    const tenure = scene.rosterTenures.find((t) => t.id === tenureId)!;
    const player = scene.players.find((p) => p.id === tenure.playerId)!;
    return {
      nationality: null,
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

  const roster2027 = lcs2027?.teams.find((entry) => entry.teamId === team.id);
  const starterIds = new Set(roster2027?.starters.map((starter) => starter.playerId));
  const addedPlayers = new Map((lcs2027?.addedPlayers ?? []).map((player) => [player.playerId, player]));
  const starters2027: RosterEntryView[] = (roster2027?.starters ?? []).map((starter) => {
    const added = addedPlayers.get(starter.playerId);
    const scenePlayer = scene.players.find((p) => p.id === starter.playerId);
    return {
      nationality: added?.nationality ?? null,
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
  const activeRoster = roster2027 ? starters2027 : roster;
  const formerRoster = roster2027 ? roster.filter((entry) => !starterIds.has(entry.playerId)) : [];
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
      ...(roster2027 ? [{ id: `${team.id}-2027-lineup`, date: lcs2027!.confirmedBy, text: "2027 starting lineup confirmed." }] : []),
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
