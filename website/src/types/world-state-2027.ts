export interface RegionalMembershipTeam {
  teamId: string;
  name: string;
  note?: string;
  parentTeamId?: string;
}

export interface RegionalMembershipInactiveTeam extends RegionalMembershipTeam {
  effectiveExitDate: string;
  lastActiveTier1Season: string;
}

export interface RegionalMembership {
  active: RegionalMembershipTeam[];
  inactive: RegionalMembershipInactiveTeam[];
}

export interface LeagueRegionalMembership2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  effectiveDate: string;
  disclaimer: string;
  rule: string;
  regions: Record<string, RegionalMembership>;
}

export interface FreeAgent2027 {
  playerId: string;
  nickname: string;
  previousTeamId: string;
  previousTeamName: string;
  league: string;
  effectiveDate: string;
  status: "free-agent";
  reasonCategory?: string;
  note?: string;
}

export interface FreeAgents2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  disclaimer: string;
  players: FreeAgent2027[];
}

export interface Tier2LeagueTeam {
  teamId: string;
  name: string;
  parentTeamId: string | null;
}

export interface Tier2League2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  name: string;
  tier: "regional-tier-2";
  region: string;
  effectiveDate: string;
  disclaimer: string;
  teams: Tier2LeagueTeam[];
}

export interface WorldState2027 {
  membership: LeagueRegionalMembership2027;
  freeAgents: FreeAgents2027;
  tier2Leagues: Record<string, Tier2League2027>;
}
