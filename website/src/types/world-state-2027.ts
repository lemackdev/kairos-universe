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
  previousTeamId: string | null;
  previousTeamName: string | null;
  previousRole: RosterRole2027 | null;
  status: "retired";
  priorStatus?: PriorStatus2027;
  note?: string;
}

export interface AddedPlayer2027 {
  playerId: string;
  slug: string;
  nickname: string;
  legalName: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  primaryRole: RosterRole2027;
  originType: "real-world-reference";
  reviewStatus: string;
  sources: Array<{ title: string; url: string }>;
  history: Array<{ teamName: string; role: RosterRole2027; joinedDate: string; basis: string }>;
  notes: string[];
}

export interface Departure2027 {
  playerId: string;
  nickname: string;
  teamId: string;
  teamName: string;
  league: string;
  role: RosterRole2027;
  designation: "main" | "substitute";
  tenureId: string;
  reason: "transferred" | "retired" | "available-for-market";
  destinationTeamId?: string;
  destinationTeamName?: string;
}

export interface Vacancy2027 {
  teamId: string;
  teamName: string;
  league: string;
  role: RosterRole2027;
  formerPlayerId: string;
  formerNickname: string;
}

export interface PendingIdentity2027 {
  teamId: string;
  teamName: string;
  role: RosterRole2027;
  nickname: string;
  reason: string;
}

export interface MarketAvailability2027 {
  playerId: string;
  nickname: string;
  previousTeamId: string;
  previousTeamName: string;
  previousRole: RosterRole2027;
  eligibleRegion: string;
  targetLeague: string;
  status: "available-for-market";
  note: string;
  priorStatus?: PriorStatus2027;
}

export interface OutgoingPlayer2027 {
  playerId: string;
  nickname: string;
  previousTeamName: string;
  eligibleRegion: string;
  status: "confirmed-lcs";
  destinationTeamId: string;
  destinationTeamName: string;
}

export interface LcsRosters2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  confirmedBy: string | null;
  confirmedPeriod?: string;
  displayPeriod?: string;
  league?: string;
  disclaimer: string;
  addedPlayers: AddedPlayer2027[];
  teams: LcsTeamRoster2027[];
  retirements: Retirement2027[];
  departures: Departure2027[];
  vacancies: Vacancy2027[];
  pendingIdentities?: PendingIdentity2027[];
  marketAvailability?: MarketAvailability2027[];
  outgoing?: OutgoingPlayer2027[];
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
  externalRosters?: {
    rosterFile: string;
    directiveId: string;
    teamCount: number;
    playerAssignmentCount: number;
    referenceSnapshot: string;
    status: string;
  };
}

export interface CsExternalReference2027 {
  system: string;
  type: string;
  id?: string;
  url?: string;
  name?: string;
  status?: string;
}

export interface CsOrganization2027 {
  organizationId: string;
  slug: string;
  name: string;
  originType: "real-world-reference";
  reviewStatus: string;
  sourceIds: string[];
  teamIds: string[];
}

export interface CsPlayer2027 {
  playerId: string;
  slug: string;
  nickname: string;
  legalName: string;
  nationality: string;
  game: "Counter-Strike 2";
  originType: "real-world-reference";
  reviewStatus: string;
  sourceIds: string[];
}

export interface CsStarter2027 {
  playerId: string;
  nickname: string;
  identity: "new" | "existing-canon-person";
}

export interface CsTeam2027 {
  teamId: string;
  slug: string;
  name: string;
  spreadsheetName: string;
  game: "Counter-Strike 2";
  hltvTeamId: string;
  externalReferences: CsExternalReference2027[];
  organizationId: string | null;
  organizationAction: "existing-organization-cs-team-created" | "new-organization-created";
  organizationConfidence: string;
  organizationMatchBasis?: string;
  rosterStatus: "starting-five";
  starters: CsStarter2027[];
  notes?: string[];
}

export interface CsContinuityCase2027 {
  caseId: string;
  personId: string;
  nickname: string;
  legalName: string;
  playerTeamId: string;
  effectiveFrom: string;
  status: string;
  rosterLabel?: string;
  kairosCoachTenureId: string;
  kairosCoachTenurePreserved: boolean;
  kairosCoachTenureEndDate: string | null;
  statements: string[];
  notEstablished: string[];
  kairosAcademyRosterChanged: boolean;
}

export interface CsExternalRosters2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  directiveId: string;
  name: string;
  game: "Counter-Strike 2";
  season: number;
  freezeDirectiveId: string;
  referenceSnapshot: { provider: string; researchDate: string; workbook: string; scope: string; note: string };
  expectedTeamCount: number;
  expectedPlayerAssignments: number;
  roleNote: string;
  disclaimer: string;
  organizations: CsOrganization2027[];
  teams: CsTeam2027[];
  players: CsPlayer2027[];
  continuityCases: CsContinuityCase2027[];
}

export interface EventInvites2027 {
  continuityId: "kairos-universe";
  originType: "fictional";
  canonStatus: string;
  sourceIds: string[];
  competitionId: string;
  competitionSlug: string;
  status: "invited";
  expectedTeamCount: number;
  inviteDate: string | null;
  teams: Array<{ teamId: string; name: string }>;
  notEstablished: string[];
}

export interface PlayerNationalities2027 {
  continuityId: "kairos-universe";
  originType: string;
  canonStatus: string;
  sourceIds: string[];
  regionByLeague: Record<string, string>;
  defaultNationalityByLeague: Record<string, string>;
  players: Record<string, { nickname: string; nationality: string; basis: string }>;
  notes: string[];
}

export interface PlayerLegalNames2027 {
  continuityId: "kairos-universe";
  originType: string;
  canonStatus: string;
  sourceIds: string[];
  players: Record<string, { nickname: string; legalName: string; basis: string }>;
  notes: string[];
}

export interface CsPlayerRoles2027 {
  continuityId: "kairos-universe";
  originType: string;
  canonStatus: string;
  sourceIds: string[];
  players: Record<string, { nickname: string; role: string; basis: string }>;
  notes: string[];
}

export interface OrganizationOverviews2027 {
  continuityId: "kairos-universe";
  originType: string;
  canonStatus: string;
  sourceIds: string[];
  organizations: Record<string, { name: string; overview: string }>;
  tier2Teams: Record<string, { overview: string }>;
  notes: string[];
}

export interface TeamLocations2027 {
  continuityId: "kairos-universe";
  originType: string;
  canonStatus: string;
  sourceIds: string[];
  capitals: Record<string, string>;
  lol: Record<string, { orgCountry: string; teamCountry: string }>;
  cs: Record<string, { orgCountry: string; teamCountry: string; teamCity?: string; headCoach?: string }>;
  notes: string[];
}

export interface WorldState2027 {
  eventInvites: EventInvites2027[];
  lcsRosters: LcsRosters2027;
  lecRosters: LcsRosters2027;
  lplRosters: LcsRosters2027;
  lckRosters: LcsRosters2027;
  lcpRosters: LcsRosters2027;
  naclRosters: LcsRosters2027;
  emeaMastersRosters: LcsRosters2027;
  lckChallengersRosters: LcsRosters2027;
  ldlRosters: LcsRosters2027;
  lcpChallengersRosters: LcsRosters2027;
  circuitoDesafianteRosters: LcsRosters2027;
  playerNationalities: PlayerNationalities2027;
  playerLegalNames: PlayerLegalNames2027;
  csPlayerRoles: CsPlayerRoles2027;
  organizationOverviews: OrganizationOverviews2027;
  teamLocations: TeamLocations2027;
  cblolRosters: LcsRosters2027;
  csRosterFreeze: CounterStrikeRosterFreeze2027;
  csExternalRosters: CsExternalRosters2027;
  membership: LeagueRegionalMembership2027;
  freeAgents: FreeAgents2027;
  tier2Leagues: Record<string, Tier2League2027>;
}
