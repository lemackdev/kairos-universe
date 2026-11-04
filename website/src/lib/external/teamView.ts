import type { RosterEntryView, SourceView, TeamView } from "@/types/catalog";
import type { ExternalScene, SceneTeam } from "@/types/external-scene";

export function sceneTeamToTeamView(team: SceneTeam, scene: ExternalScene): TeamView {
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
    transactions: [{ id: `${team.id}-observed`, date: event.eventEndDate, text: `Roster observed at ${event.title}.` }],
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
