import fs from "node:fs";
import path from "node:path";
import { repositoryRoot } from "@/lib/canon/paths";
import type { CounterStrikeRosterFreeze2027, CsExternalRosters2027, EventInvites2027, FreeAgents2027, LcsRosters2027, LeagueRegionalMembership2027, Tier2League2027, WorldState2027 } from "@/types/world-state-2027";

export const regionalCompetitionSlugs: Record<string, { league: string } | { tier2: string }> = {
  "lck-2027": { league: "LCK" },
  "lpl-2027": { league: "LPL" },
  "lec-2027": { league: "LEC" },
  "lcs-2027": { league: "LCS" },
  "lcp-2027": { league: "LCP" },
  "cblol-2027": { league: "CBLOL" },
  "lcs-tier-2-2027": { league: "NACL" },
  "lec-tier-2-2027": { tier2: "EMEA Masters" },
  "lck-tier-2-2027": { tier2: "LCK Challengers" },
  "lcp-tier-2-2027": { tier2: "LCP Challengers" },
  "cblol-tier-2-2027": { tier2: "Circuito Desafiante" },
  "lpl-tier-2-2027": { tier2: "LDL" },
};

export function fieldCaptionFor(worldState: WorldState2027 | undefined, competitionSlug: string): string {
  return worldState?.eventInvites.some((entry) => entry.competitionSlug === competitionSlug) ? "Invited teams (2027)" : "Participants (2027)";
}

export function regionalFieldFor(worldState: WorldState2027 | undefined, competitionSlug: string): { name: string; teamId: string }[] | null {
  if (!worldState) return null;
  const invited = worldState.eventInvites.find((entry) => entry.competitionSlug === competitionSlug);
  if (invited) return invited.teams.map((team) => ({ name: team.name, teamId: team.teamId }));
  const entry = regionalCompetitionSlugs[competitionSlug];
  if (!entry) return null;
  if ("league" in entry) {
    const region = worldState.membership.regions[entry.league];
    return region ? region.active.map((team) => ({ name: team.name, teamId: team.teamId })) : null;
  }
  const league = worldState.tier2Leagues[entry.tier2];
  return league ? league.teams.map((team) => ({ name: team.name, teamId: team.teamId })) : null;
}

const overridesRoot = path.join(repositoryRoot, "data", "competitive-world-overrides");
const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(overridesRoot, file), "utf8")) as T;

const tier2Files: Record<string, string> = {
  "EMEA Masters": "emea-masters-2027.json",
  "LCK Challengers": "lck-challengers-2027.json",
  "LCP Challengers": "lcp-challengers-2027.json",
  "Circuito Desafiante": "circuito-desafiante-2027.json",
  LDL: "ldl-2027.json",
};

export function loadWorldState2027(): WorldState2027 {
  const membership = read<LeagueRegionalMembership2027>("league-regional-membership-2027.json");
  const freeAgents = read<FreeAgents2027>("free-agents-2027.json");
  for (const [league, region] of Object.entries(membership.regions)) {
    if (region.active.length !== 8) throw new Error(`2027 regional membership for ${league} must have 8 active teams, found ${region.active.length}`);
  }
  const activeIds = new Set(Object.values(membership.regions).flatMap((region) => region.active.map((team) => team.teamId)));
  const inactiveIds = new Set(Object.values(membership.regions).flatMap((region) => region.inactive.map((team) => team.teamId)));
  for (const id of inactiveIds) if (activeIds.has(id)) throw new Error(`Team listed as both active and inactive in 2027 regional membership: ${id}`);
  const lcsRosters = read<LcsRosters2027>("lcs-rosters-2027.json");
  const lecRosters = read<LcsRosters2027>("lec-rosters-2027.json");
  const lplRosters = read<LcsRosters2027>("lpl-rosters-2027.json");
  const lckRosters = read<LcsRosters2027>("lck-rosters-2027.json");
  const lcpRosters = read<LcsRosters2027>("lcp-rosters-2027.json");
  const cblolRosters = read<LcsRosters2027>("cblol-rosters-2027.json");
  const csRosterFreeze = read<CounterStrikeRosterFreeze2027>("counter-strike-roster-freeze-2027.json");
  const regionalSets: Array<[string, LcsRosters2027]> = [["LCS", lcsRosters], ["LEC", lecRosters], ["LPL", lplRosters], ["CBLOL", cblolRosters], ["LCK", lckRosters], ["LCP", lcpRosters]];
  for (const [league, set] of regionalSets) validateRegionalRosters(set, league, membership, freeAgents, regionalSets.filter(([, other]) => other !== set).map(([, other]) => other));
  const csExternalRosters = read<CsExternalRosters2027>("counter-strike-external-rosters-2027.json");
  validateCsFreeze(csRosterFreeze);
  validateCsExternalRosters(csExternalRosters, csRosterFreeze);
  const eventInvites = ["iem-dallas-invites-2027.json", "cct-north-america-1-invites-2027.json"].map((file) => read<EventInvites2027>(file));
  for (const invites of eventInvites) validateEventInvites(invites, csExternalRosters);
  const seenPlayers = new Set<string>();
  for (const player of freeAgents.players) {
    if (seenPlayers.has(player.playerId)) throw new Error(`Duplicate 2027 free agent entry: ${player.playerId}`);
    seenPlayers.add(player.playerId);
  }

  const tier2Leagues: Record<string, Tier2League2027> = {};
  for (const [key, file] of Object.entries(tier2Files)) {
    const league = read<Tier2League2027>(file);
    if (league.teams.length !== 8) throw new Error(`2027 Tier 2 ecosystem ${key} must have 8 teams, found ${league.teams.length}`);
    const ids = new Set(league.teams.map((team) => team.teamId));
    if (ids.size !== 8) throw new Error(`2027 Tier 2 ecosystem ${key} has duplicate team IDs`);
    tier2Leagues[key] = league;
  }

  return { membership, freeAgents, tier2Leagues, lcsRosters, lecRosters, lplRosters, cblolRosters, lckRosters, lcpRosters, csRosterFreeze, csExternalRosters, eventInvites };
}

export function findFreeAgent(worldState: WorldState2027 | undefined, playerId: string) {
  return worldState?.freeAgents.players.find((player) => player.playerId === playerId) ?? null;
}

export interface Tier2TeamLookup {
  teamId: string;
  name: string;
  ecosystem: string;
  region: string;
  parentTeamId: string | null;
}

export function findTier2Team(worldState: WorldState2027 | undefined, teamId: string): Tier2TeamLookup | null {
  if (!worldState) return null;
  for (const league of Object.values(worldState.tier2Leagues)) {
    const team = league.teams.find((entry) => entry.teamId === teamId);
    if (team) return { teamId: team.teamId, name: team.name, ecosystem: league.name, region: league.region, parentTeamId: team.parentTeamId };
  }
  const nacl = worldState.membership.regions.NACL;
  if (nacl) {
    const team = [...nacl.active, ...nacl.inactive].find((entry) => entry.teamId === teamId && entry.teamId.startsWith("tier2-"));
    if (team) return { teamId: team.teamId, name: team.name, ecosystem: "NACL", region: "North America", parentTeamId: team.parentTeamId ?? null };
  }
  return null;
}

export function listAllTier2Teams(worldState: WorldState2027 | undefined): Tier2TeamLookup[] {
  if (!worldState) return [];
  const teams: Tier2TeamLookup[] = [];
  for (const league of Object.values(worldState.tier2Leagues)) {
    for (const team of league.teams) teams.push({ teamId: team.teamId, name: team.name, ecosystem: league.name, region: league.region, parentTeamId: team.parentTeamId });
  }
  const nacl = worldState.membership.regions.NACL;
  if (nacl) {
    for (const team of [...nacl.active, ...nacl.inactive]) {
      if (team.teamId.startsWith("tier2-")) teams.push({ teamId: team.teamId, name: team.name, ecosystem: "NACL", region: "North America", parentTeamId: team.parentTeamId ?? null });
    }
  }
  return teams;
}

export function findRegionalStatus(worldState: WorldState2027 | undefined, teamId: string): { league: string; active: boolean; note?: string; effectiveExitDate?: string } | null {
  if (!worldState) return null;
  for (const [league, region] of Object.entries(worldState.membership.regions)) {
    const active = region.active.find((team) => team.teamId === teamId);
    if (active) return { league, active: true, note: active.note };
    const inactive = region.inactive.find((team) => team.teamId === teamId);
    if (inactive) return { league, active: false, effectiveExitDate: inactive.effectiveExitDate };
  }
  return null;
}

const rosterRoles = ["top", "jungle", "mid", "bot", "support"];

function validateRegionalRosters(rosters: LcsRosters2027, league: string, membership: LeagueRegionalMembership2027, freeAgents: FreeAgents2027, otherSets: LcsRosters2027[]): void {
  const active = new Set(membership.regions[league]?.active.map((team) => team.teamId));
  if (rosters.teams.length !== 8) throw new Error(`2027 ${league} rosters must cover 8 teams, found ${rosters.teams.length}`);
  const starterIds = new Set<string>();
  const otherStarterIds = new Set(otherSets.flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId))));
  for (const team of rosters.teams) {
    if (!active.has(team.teamId)) throw new Error(`2027 ${league} roster team is not an active ${league} 2027 participant: ${team.teamId}`);
    const pendingRoles = (rosters.pendingIdentities ?? []).filter((entry) => entry.teamId === team.teamId).map((entry) => entry.role);
    const claimed = [...team.starters.map((starter) => starter.role), ...pendingRoles];
    if (claimed.length !== 5 || !rosterRoles.every((role) => claimed.filter((entry) => entry === role).length === 1)) {
      throw new Error(`2027 ${league} roster must have exactly one starter (or pending identity) per role: ${team.teamId}`);
    }
    for (const starter of team.starters) {
      if (starterIds.has(starter.playerId) || otherStarterIds.has(starter.playerId)) throw new Error(`Player appears in two 2027 lineups: ${starter.playerId}`);
      starterIds.add(starter.playerId);
    }
  }
  if (new Set(rosters.teams.map((team) => team.teamId)).size !== 8) throw new Error(`Duplicate team in 2027 ${league} rosters`);
  const retiredIds = new Set<string>();
  const otherRetiredIds = new Set(otherSets.flatMap((set) => set.retirements.map((entry) => entry.playerId)));
  for (const retirement of rosters.retirements) {
    if (retiredIds.has(retirement.playerId) || otherRetiredIds.has(retirement.playerId)) throw new Error(`Duplicate 2027 retirement: ${retirement.playerId}`);
    retiredIds.add(retirement.playerId);
    if (starterIds.has(retirement.playerId) || otherStarterIds.has(retirement.playerId)) throw new Error(`Player is both a 2027 starter and retired: ${retirement.playerId}`);
  }
  const marketIds = new Set((rosters.marketAvailability ?? []).map((entry) => entry.playerId));
  for (const id of marketIds) if (starterIds.has(id) || otherStarterIds.has(id) || retiredIds.has(id)) throw new Error(`Market-available player has a contradicting 2027 status: ${id}`);
  const lineupTeamIds = new Set([rosters, ...otherSets].flatMap((set) => set.teams.map((team) => team.teamId)));
  const otherDepartureTenures = new Set(otherSets.flatMap((set) => set.departures.map((entry) => entry.tenureId)));
  for (const departure of rosters.departures) {
    if (!starterIds.has(departure.playerId) && !retiredIds.has(departure.playerId) && !marketIds.has(departure.playerId)) throw new Error(`Departure for a player with no 2027 assignment, retirement or market status: ${departure.playerId}`);
    if (departure.destinationTeamId === departure.teamId) throw new Error(`Departure matches the destination team: ${departure.playerId}`);
    if (otherDepartureTenures.has(departure.tenureId)) throw new Error(`Departure duplicated across 2027 roster sets: ${departure.tenureId}`);
    const stillStarts = [rosters, ...otherSets].some((set) => set.teams.find((team) => team.teamId === departure.teamId)?.starters.some((starter) => starter.playerId === departure.playerId));
    if (stillStarts) throw new Error(`Departed player is still an active starter on the previous team: ${departure.playerId}`);
  }
  for (const vacancy of rosters.vacancies) {
    if (lineupTeamIds.has(vacancy.teamId)) throw new Error(`Vacancy listed for a team with a confirmed lineup: ${vacancy.teamId}`);
  }
  for (const player of freeAgents.players) {
    if (starterIds.has(player.playerId) || retiredIds.has(player.playerId) || marketIds.has(player.playerId)) {
      throw new Error(`Player has a current free-agent status that contradicts a confirmed 2027 assignment: ${player.playerId}`);
    }
  }
}

function validateCsFreeze(freeze: CounterStrikeRosterFreeze2027): void {
  if (freeze.freezeThrough !== "2027-05-23" || freeze.earliestLaterChangeDate !== "2027-05-24") {
    throw new Error("Counter-Strike roster freeze must run through 2027-05-23, with 2027-05-24 as the earliest later change date");
  }
}

const kairosCsPlayerIds = (freeze: CounterStrikeRosterFreeze2027) => new Set(Object.values(freeze.preservedKairosRosters).flat());

function validateCsExternalRosters(rosters: CsExternalRosters2027, freeze: CounterStrikeRosterFreeze2027): void {
  const fail = (message: string): never => { throw new Error(`Counter-Strike external rosters: ${message}`); };
  if (rosters.freezeDirectiveId !== freeze.directiveId) fail("must reference the existing roster-freeze directive");
  const ext = freeze.externalRosters;
  if (!ext || ext.directiveId !== rosters.directiveId || ext.teamCount !== rosters.teams.length || ext.playerAssignmentCount !== rosters.expectedPlayerAssignments) fail("roster freeze does not match the imported roster set");
  if (rosters.teams.length !== rosters.expectedTeamCount || rosters.teams.length !== 50) fail(`expected 50 teams, found ${rosters.teams.length}`);
  if (JSON.stringify(rosters).match(/chicken coop|13107/i)) fail("Chicken Coop must be excluded completely");
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) fail(`duplicate ${label}`); };
  unique(rosters.teams.map((team) => team.teamId), "team id");
  unique(rosters.teams.map((team) => team.slug), "team slug");
  unique(rosters.teams.map((team) => team.hltvTeamId), "HLTV team id");
  unique(rosters.organizations.map((org) => org.organizationId), "organization id");
  unique(rosters.organizations.map((org) => org.slug), "organization slug");
  unique(rosters.players.map((player) => player.playerId), "player id");
  unique(rosters.players.map((player) => player.slug), "player slug");
  const organizationKeys = rosters.teams.filter((team) => team.organizationId).map((team) => team.organizationId as string);
  unique(organizationKeys, "organization with two Counter-Strike teams");
  const newOrgIds = new Set(rosters.organizations.map((org) => org.organizationId));
  const playerIds = new Set(rosters.players.map((player) => player.playerId));
  const personIds = new Set(rosters.continuityCases.map((entry) => entry.personId));
  const kairos = kairosCsPlayerIds(freeze);
  const starterIds: string[] = [];
  for (const team of rosters.teams) {
    if (team.starters.length !== 5) fail(`${team.teamId} must have five starters`);
    if (!/^\d+$/.test(team.hltvTeamId) || !team.externalReferences.some((ref) => ref.system === "HLTV" && ref.id === team.hltvTeamId)) fail(`${team.teamId} lacks its HLTV reference`);
    if (team.organizationAction === "new-organization-created") {
      if (!team.organizationId || !newOrgIds.has(team.organizationId)) fail(`${team.teamId} references a missing new organization`);
    } else if (!team.organizationId || newOrgIds.has(team.organizationId)) fail(`${team.teamId} must reuse an existing organization`);
    for (const starter of team.starters) {
      starterIds.push(starter.playerId);
      if (kairos.has(starter.playerId)) fail(`Kairos player in an external roster: ${starter.playerId}`);
      if (starter.identity === "new" ? !playerIds.has(starter.playerId) : !personIds.has(starter.playerId)) fail(`unresolved starter identity: ${starter.playerId}`);
    }
  }
  if (starterIds.length !== rosters.expectedPlayerAssignments || starterIds.length !== 250) fail(`expected 250 assignments, found ${starterIds.length}`);
  unique(starterIds, "starter (player on two external lineups)");
  for (const player of rosters.players) {
    if (!player.nickname || !player.legalName || !player.nationality) fail(`incomplete player: ${player.playerId}`);
    if (!starterIds.includes(player.playerId)) fail(`player without an assignment: ${player.playerId}`);
  }
  const teamIds = new Set(rosters.teams.map((team) => team.teamId));
  for (const entry of rosters.continuityCases) {
    if (!teamIds.has(entry.playerTeamId) || !starterIds.includes(entry.personId)) fail(`continuity case is not assigned: ${entry.caseId}`);
    if (entry.kairosCoachTenureEndDate !== null || !entry.kairosCoachTenurePreserved || entry.kairosAcademyRosterChanged) fail(`continuity case invents a transition: ${entry.caseId}`);
  }
}

export function csExternalTeams(worldState: WorldState2027 | undefined) {
  return worldState?.csExternalRosters.teams ?? [];
}

export function csExternalPlayers(worldState: WorldState2027 | undefined) {
  return worldState?.csExternalRosters.players ?? [];
}

export function findCsAssignment(worldState: WorldState2027 | undefined, playerId: string) {
  const team = csExternalTeams(worldState).find((entry) => entry.starters.some((starter) => starter.playerId === playerId));
  return team ? { team, starter: team.starters.find((starter) => starter.playerId === playerId)! } : null;
}

export function csTeamsOfOrganization(worldState: WorldState2027 | undefined, organizationId: string) {
  return csExternalTeams(worldState).filter((team) => team.organizationId === organizationId);
}

export function rosterSets(worldState: WorldState2027 | undefined): LcsRosters2027[] {
  return worldState ? [worldState.lcsRosters, worldState.lecRosters, worldState.lplRosters, worldState.cblolRosters, worldState.lckRosters, worldState.lcpRosters] : [];
}

export function rosterLeague(set: LcsRosters2027): string {
  return set.league ?? "LCS";
}

export function findLcsAssignment(worldState: WorldState2027 | undefined, playerId: string) {
  for (const rosters of rosterSets(worldState)) {
    for (const team of rosters.teams) {
      const starter = team.starters.find((entry) => entry.playerId === playerId);
      if (starter) return { team, starter, rosters, league: rosterLeague(rosters) };
    }
  }
  return null;
}

export function findRetirement(worldState: WorldState2027 | undefined, playerId: string) {
  for (const rosters of rosterSets(worldState)) {
    const entry = rosters.retirements.find((retirement) => retirement.playerId === playerId);
    if (entry) return { ...entry, rosters };
  }
  return null;
}

export function findMarketAvailability(worldState: WorldState2027 | undefined, playerId: string) {
  for (const rosters of rosterSets(worldState)) {
    const entry = rosters.marketAvailability?.find((market) => market.playerId === playerId);
    if (entry) return { ...entry, rosters };
  }
  return null;
}

export function allAddedPlayers(worldState: WorldState2027 | undefined) {
  return rosterSets(worldState).flatMap((set) => set.addedPlayers);
}

export function csOrganizationSlugOf(worldState: WorldState2027, team: { organizationId: string | null }): string {
  const added = worldState.csExternalRosters.organizations.find((org) => org.organizationId === team.organizationId);
  return added ? added.slug : (team.organizationId ?? "").replace(/^external-lol-org-/, "external-");
}

function validateEventInvites(invites: EventInvites2027, rosters: CsExternalRosters2027): void {
  const fail = (message: string): never => { throw new Error(`${invites.competitionSlug} invites: ${message}`); };
  const ids = invites.teams.map((team) => team.teamId);
  if (ids.length !== invites.expectedTeamCount || ids.length !== 16) fail(`expected 16 invited teams, found ${ids.length}`);
  if (new Set(ids).size !== ids.length) fail("duplicate invited team");
  const known = new Set([...rosters.teams.map((team) => team.teamId), "kairos-cs-main"]);
  for (const id of ids) if (!known.has(id)) fail(`invited team is not a Counter-Strike team: ${id}`);
}
