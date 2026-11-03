import fs from "node:fs";
import path from "node:path";
import { repositoryRoot } from "@/lib/canon/paths";
import type { FreeAgents2027, LeagueRegionalMembership2027, Tier2League2027, WorldState2027 } from "@/types/world-state-2027";

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

  return { membership, freeAgents, tier2Leagues };
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
