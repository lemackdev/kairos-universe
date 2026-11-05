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

export type RosterRole2027 = "top" | "jungle" | "mid" | "bot" | "support";

export interface PriorStatus2027 {
  status: "free-agent";
  previousTeamId: string;
  previousTeamName: string;
  effectiveDate: string;
}

export interface LcsStarter2027 {
  role: RosterRole2027;
  playerId: string;
  nickname: string;
  priorStatus?: PriorStatus2027;
  note?: string;
}

export interface LcsTeamRoster2027 {
  teamId: string;
  name: string;
  internal?: boolean;
  starters: LcsStarter2027[];
}

export interface Retirement2027 {
  playerId: string;
  nickname: string;
  previousTeamId: string;
  previousTeamName: string;
  previousRole: RosterRole2027;
  status: "retired";
  priorStatus?: PriorStatus2027;
}

export interface AddedPlayer2027 {
  playerId: string;
  slug: string;
  nickname: string;
  legalName: string;
  nationality: string;
  dateOfBirth: string;
  primaryRole: RosterRole2027;
  originType: "real-world-reference";
  reviewStatus: string;
  sources: Array<{ title: string; url: string }>;
  history: Array<{ teamName: string; role: RosterRole2027; joinedDate: string; basis: string }>;
  notes: string[];
}

export interface LcsRosters2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  confirmedBy: string;
  disclaimer: string;
  addedPlayers: AddedPlayer2027[];
  teams: LcsTeamRoster2027[];
  retirements: Retirement2027[];
}

export interface CounterStrikeRosterFreeze2027 {
  directiveId: string;
  name: string;
  game: string;
  freezeThrough: string;
  freezeThroughInclusive: boolean;
  earliestLaterChangeDate: string;
  anchorCompetitionId: string;
  anchorCompetitionDates: { startDate: string; endDate: string };
  authorOverrideAllowed: boolean;
  scope: string;
  notEstablished: string[];
  preservedKairosRosters: Record<string, string[]>;
  sourceIds: string[];
}

export interface WorldState2027 {
  lcsRosters: LcsRosters2027;
  csRosterFreeze: CounterStrikeRosterFreeze2027;
  membership: LeagueRegionalMembership2027;
  freeAgents: FreeAgents2027;
  tier2Leagues: Record<string, Tier2League2027>;
}
