export type ReviewStatus =
  | "imported"
  | "validated"
  | "needs-review"
  | "approved"
  | "rejected";

export interface SourceRecord {
  sourceId: string;
  sourceType: "leaguepedia-page";
  pageTitle: string;
  pageId: number | null;
  revisionId: number | null;
  revisionTimestamp: string | null;
  retrievedAt: string;
  snapshotId: string;
  license: "CC-BY-SA-3.0";
}

export interface ProvenanceFields {
  sourceSnapshotId: string;
  importerVersion: string;
  rawRecordChecksum: string;
  retrievedAt: string;
  reviewStatus: ReviewStatus;
  reviewNotes: string[];
  sources: string[];
}

export interface NormalizedOrganization extends ProvenanceFields {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  originType: "real-world-reference";
  continuityId: "kairos-universe";
  sourceOrganizationPage: string;
  status: "active";
  location: string | null;
  region: string | null;
  teamIds: string[];
}

export interface NormalizedTeam extends ProvenanceFields {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  gameId: "league-of-legends";
  organizationId: string | null;
  originType: "real-world-reference";
  continuityId: "kairos-universe";
  leaguepediaOverviewPage: string;
  region: string | null;
  location: string | null;
  status: "active";
  isDisbanded: boolean;
  currentPlayerTenureIds: string[];
  currentStaffTenureIds: string[];
}

export interface NormalizedPlayer extends ProvenanceFields {
  id: string;
  slug: string;
  nickname: string;
  legalName: string | null;
  fullName: string | null;
  countryOfBirth: string | null;
  nationalities: string[];
  residency: string | null;
  dateOfBirth: string | null;
  primaryRole: string | null;
  currentTeamId: string | null;
  originType: "real-world-reference";
  continuityId: "kairos-universe";
  leaguepediaPage: string;
  aliases: string[];
}

export interface NormalizedStaff extends ProvenanceFields {
  id: string;
  slug: string;
  nickname: string;
  legalName: string | null;
  fullName: string | null;
  countryOfBirth: string | null;
  nationalities: string[];
  residency: string | null;
  currentTeamId: string | null;
  originType: "real-world-reference";
  continuityId: "kairos-universe";
  leaguepediaPage: string;
  aliases: string[];
  linkedPlayerId: string | null;
}

export type CanonicalRole =
  | "top"
  | "jungle"
  | "mid"
  | "bot"
  | "support"
  | "unknown";

export interface NormalizedRosterTenure extends ProvenanceFields {
  id: string;
  playerId: string;
  teamId: string;
  gameId: "league-of-legends";
  roles: CanonicalRole[];
  rawRoles: string[];
  rosterStatus: "active" | "inactive";
  isStarter: boolean;
  isSubstitute: boolean;
  isTrainee: boolean;
  isInactive: boolean;
  joinedDate: string | null;
  joinedDatePrecision: "day" | "month" | "year" | "unknown";
  leftDate: string | null;
  isCurrentAtSnapshot: boolean;
  snapshotId: string;
  effectiveUniversePeriod: string;
  frozenUntilPeriod: string;
}

export interface NormalizedStaffTenure extends ProvenanceFields {
  id: string;
  staffId: string;
  teamId: string;
  gameId: "league-of-legends";
  role: string;
  rosterStatus: "active" | "inactive";
  joinedDate: string | null;
  joinedDatePrecision: "day" | "month" | "year" | "unknown";
  leftDate: string | null;
  isCurrentAtSnapshot: boolean;
  snapshotId: string;
  effectiveUniversePeriod: string;
  frozenUntilPeriod: string;
}

export interface AliasRecord {
  id: string;
  entityType: "player" | "staff" | "team" | "organization";
  entityId: string;
  alias: string;
  aliasType:
    | "redirect"
    | "previous-nickname"
    | "alternate-capitalization"
    | "romanization"
    | "rename";
}
