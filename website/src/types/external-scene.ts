export type SceneRole = "top" | "jungle" | "mid" | "bot" | "support";
export interface SceneSource {
  id: string;
  title: string;
  url: string;
  eventEndDate: string;
  retrievedDate: string;
  retrievalMethod: "indexed-tournament-page";
  revisionId: null;
}
export interface SceneEntity {
  id: string;
  slug: string;
  originType: "real-world-reference";
  reviewStatus: "researched-needs-review";
  sourceIds: string[];
}
export interface SceneOrganization extends SceneEntity {
  name: string;
  teamIds: string[];
  legalCompanyName: null;
  headquarters: null;
}
export interface SceneTeam extends SceneEntity {
  name: string;
  organizationId: string;
  gameId: "league-of-legends";
  league: string;
  region: string;
  tier: number;
  rosterTenureIds: string[];
  basis: "final-domestic-cycle" | "last-available-domestic-tournament";
  notes: string[];
}
export interface ScenePlayer extends SceneEntity {
  nickname: string;
  legalName: null;
  nationality: null;
  dateOfBirth: null;
  rosterTenureIds: string[];
}
export interface SceneRosterTenure extends SceneEntity {
  playerId: string;
  teamId: string;
  role: SceneRole;
  designation: "main" | "substitute";
  observedAtEventEnd: string;
  joinedDate: null;
  leftDate: null;
  isCurrent: null;
  isCaptain: null;
}
export interface ExternalScene {
  snapshotId: string;
  researchDate: string;
  scope: string;
  notes: string[];
  sources: SceneSource[];
  organizations: SceneOrganization[];
  teams: SceneTeam[];
  players: ScenePlayer[];
  rosterTenures: SceneRosterTenure[];
}
export interface SceneResearch {
  league: string;
  region: string;
  tier: number;
  expectedTeamCount: number;
  sourceId: string;
  sourceUrl: string;
  eventName: string;
  eventEndDate: string;
  teams: Array<{
    key: string;
    name: string;
    sourceId: string;
    basis: SceneTeam["basis"];
    notes: string[];
    members: Array<{ nickname: string; role: SceneRole; designation: SceneRosterTenure["designation"] }>;
  }>;
}
