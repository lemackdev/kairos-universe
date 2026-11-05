import fs from "node:fs";
import path from "node:path";
import { repositoryRoot } from "@/lib/canon/paths";
import type { CounterStrikeRosterFreeze2027, FreeAgents2027, LcsRosters2027, LeagueRegionalMembership2027, Tier2League2027, WorldState2027 } from "@/types/world-state-2027";

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

export function regionalFieldFor(worldState: WorldState2027 | undefined, competitionSlug: string): { name: string; teamId: string }[] | null {
  if (!worldState) return null;
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
  const csRosterFreeze = read<CounterStrikeRosterFreeze2027>("counter-strike-roster-freeze-2027.json");
  validateLcsRosters(lcsRosters, membership, freeAgents);
  validateCsFreeze(csRosterFreeze);
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

  return { membership, freeAgents, tier2Leagues, lcsRosters, csRosterFreeze };
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

function validateLcsRosters(rosters: LcsRosters2027, membership: LeagueRegionalMembership2027, freeAgents: FreeAgents2027): void {
  const lcsActive = new Set(membership.regions.LCS?.active.map((team) => team.teamId));
  if (rosters.teams.length !== 8) throw new Error(`2027 LCS rosters must cover 8 teams, found ${rosters.teams.length}`);
  const starterIds = new Set<string>();
  for (const team of rosters.teams) {
    if (!lcsActive.has(team.teamId)) throw new Error(`2027 LCS roster team is not an active LCS 2027 participant: ${team.teamId}`);
    if (team.starters.length !== 5 || !rosterRoles.every((role) => team.starters.some((starter) => starter.role === role))) {
      throw new Error(`2027 LCS roster must have exactly one starter per role: ${team.teamId}`);
    }
    for (const starter of team.starters) {
      if (starterIds.has(starter.playerId)) throw new Error(`Player appears in two 2027 LCS lineups: ${starter.playerId}`);
      starterIds.add(starter.playerId);
    }
  }
  if (new Set(rosters.teams.map((team) => team.teamId)).size !== 8) throw new Error("Duplicate team in 2027 LCS rosters");
  const retiredIds = new Set<string>();
  for (const retirement of rosters.retirements) {
    if (retiredIds.has(retirement.playerId)) throw new Error(`Duplicate 2027 retirement: ${retirement.playerId}`);
    retiredIds.add(retirement.playerId);
    if (starterIds.has(retirement.playerId)) throw new Error(`Player is both a 2027 LCS starter and retired: ${retirement.playerId}`);
  }
  const lineupTeamIds = new Set(rosters.teams.map((team) => team.teamId));
  for (const departure of rosters.departures) {
    if (!starterIds.has(departure.playerId) && !retiredIds.has(departure.playerId)) throw new Error(`Departure for a player with no 2027 assignment or retirement: ${departure.playerId}`);
    if (departure.destinationTeamId === departure.teamId) throw new Error(`Departure matches the destination team: ${departure.playerId}`);
    const stillStarts = rosters.teams.find((team) => team.teamId === departure.teamId)?.starters.some((starter) => starter.playerId === departure.playerId);
    if (stillStarts) throw new Error(`Departed player is still an active starter on the previous team: ${departure.playerId}`);
  }
  for (const vacancy of rosters.vacancies) {
    if (lineupTeamIds.has(vacancy.teamId)) throw new Error(`Vacancy listed for a team with a confirmed full lineup: ${vacancy.teamId}`);
  }
  for (const player of freeAgents.players) {
    if (starterIds.has(player.playerId) || retiredIds.has(player.playerId)) {
      throw new Error(`Player has a current free-agent status that contradicts a confirmed 2027 assignment: ${player.playerId}`);
    }
  }
}

function validateCsFreeze(freeze: CounterStrikeRosterFreeze2027): void {
  if (freeze.freezeThrough !== "2027-05-23" || freeze.earliestLaterChangeDate !== "2027-05-24") {
    throw new Error("Counter-Strike roster freeze must run through 2027-05-23, with 2027-05-24 as the earliest later change date");
  }
}

export function findLcsAssignment(worldState: WorldState2027 | undefined, playerId: string) {
  if (!worldState) return null;
  for (const team of worldState.lcsRosters.teams) {
    const starter = team.starters.find((entry) => entry.playerId === playerId);
    if (starter) return { team, starter };
  }
  return null;
}

export function findRetirement(worldState: WorldState2027 | undefined, playerId: string) {
  return worldState?.lcsRosters.retirements.find((entry) => entry.playerId === playerId) ?? null;
}
