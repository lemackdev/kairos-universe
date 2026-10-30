export type CanonStatus =
  | "confirmed"
  | "soft-canon"
  | "unconfirmed"
  | "retconned"
  | "non-canonical";

export interface KairosVersion {
  canonVersion: string;
  project: string;
  storyEpisode: number;
  storyStartPeriod: string;
  storyPeriod: string;
  storyYear: number;
  currentNarrativeDate: string;
  nextCompetitiveMilestone: {
    period: string;
    displayName: string;
    exactDate: string;
  };
  websiteImplemented: boolean;
  currentDocumentationPhase: string;
  nextPhase: string;
  reconstructedThroughEpisode: number;
  episodeRecordsCreatedThrough: number;
  lastValidated: string | null;
  notes: string[];
}

export interface RawOrganization {
  id: string;
  slug: string;
  name: string;
  type?: string;
  status: string;
  headquarters?: LocationRecord;
  parentOrganization?: {
    id: string;
    name: string;
  };
  currentStoryPeriod?: StoryPeriod;
  divisions?: Array<Record<string, unknown>>;
  philosophy?: string[];
  longTermGoals?: string[];
  confirmedFacts: string[];
  unconfirmedDetails: string[];
  canonNotes: string[];
}

export interface RawTeam {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  organization: {
    id: string;
    name: string;
  };
  game: string;
  level: string;
  intendedCompetition: string;
  status: string;
  currentStoryPeriod: StoryPeriod;
  officialDebutPeriod: PlannedPeriod;
  roster: string[];
  coachingStaff: string[];
  mentors: string[];
  captain: string | "TBD" | null;
  trainingLocation: LocationRecord;
  competitiveHistory: unknown[];
  achievements: string[];
  statistics: Record<string, unknown>;
  confirmedFacts: string[];
  unconfirmedDetails: string[];
  canonNotes: string[];
}

export interface HistoricalAlias {
  nickname: string;
  status: "retconned" | "historical";
  sourceEpisode: string;
  notes: string;
}

export interface CanonRelationship {
  subjectId: string;
  type: string;
  status: "confirmed" | "TBD";
}

export interface RawPlayer {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  historicalAliases: HistoricalAlias[];
  nationality: string;
  city: string;
  currentResidence?: LocationRecord;
  homeTown?: LocationRecord;
  dateOfBirth: string;
  ageAtCurrentStoryDate: number | "TBD";
  game: string;
  role: string;
  currentTeam: string | "TBD" | null;
  rosterLevel: string;
  status: string;
  isCaptain: boolean | null;
  firstAppearance: string;
  joinedKairos: string;
  contract: Record<string, unknown> | null;
  relationships: CanonRelationship[];
  careerHistory: Array<Record<string, unknown>>;
  trivia?: string[];
  statistics: Record<string, unknown>;
  achievements: string[];
  confirmedFacts: string[];
  unconfirmedDetails: string[];
  canonNotes: string[];
}

export interface RawStaff {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  nationality: string;
  role: string;
  division: string;
  currentOrganization: string;
  currentTeam: string | "TBD" | null;
  status: string;
  firstAppearance: string;
  joinedKairos: string;
  realWorldFigure: boolean;
  responsibilities: string[];
  relationships: CanonRelationship[];
  confirmedFacts: string[];
  unconfirmedDetails: string[];
  canonNotes: string[];
}

export interface RawCompetition {
  id: string;
  slug: string;
  name: string;
  gameId: string;
  status: string;
  canonStatus: CanonStatus;
  sourceIds: string[];
  overview?: string;
  format?: string[];
  organizer?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  prizePool?: string | null;
  participantTeamIds?: string[];
  prizeDistribution?: Array<{ place: string; prize: string | null; teamId: string | null }>;
}

export interface RawAward {
  id: string;
  recipientId: string;
  name: string;
  date: string | null;
  competitionId: string | null;
  sourceIds: string[];
  canonStatus: CanonStatus;
}

export interface RawStanding {
  id: string;
  competitionId: string;
  teamId: string;
  position: number | null;
  sourceIds: string[];
  canonStatus: CanonStatus;
}

export interface RawEpisode {
  id: string;
  slug: string;
  episodeNumber: number;
  title: string | null;
  historicalTitle: string | null;
  exactStoryDate: string | null;
  approximateStoryPeriod: string;
  canonStatus: CanonStatus;
  characters: string[];
  firstAppearances: string[];
  organizations: string[];
  teams: string[];
  summary: string;
  sourceReferences: Array<Record<string, unknown>>;
}

export interface RosterTenure {
  id: string;
  slug: string;
  continuityId: string;
  playerId: string;
  organizationId: string;
  teamId: string;
  gameId: string;
  roleId: string;
  rosterStatus: string;
  isCaptain: boolean;
  isStarter: boolean;
  joinedDate: string | null;
  leftDate: string | null;
  datePrecision: string;
  announcementDate: string | null;
  effectiveDate: string | null;
  endReason: string | null;
  sourceIds: string[];
  canonStatus: CanonStatus;
}

export interface StaffTenure {
  id: string;
  slug: string;
  continuityId: string;
  personId: string;
  organizationId: string;
  teamId: string | null;
  divisionId: string;
  title: string;
  responsibilityIds: string[];
  startedDate: string | null;
  endedDate: string | null;
  datePrecision: string;
  status: string;
  sourceIds: string[];
  canonStatus: CanonStatus;
}

export interface SourceRecord {
  id: string;
  slug: string;
  continuityId: string;
  sourceType: string;
  title: string;
  path: string;
  locator: string | null;
  publicLabel: string;
  originType: "fictional" | "real-world-reference";
  canonStatus: CanonStatus;
  notes: string[];
}

export interface LineupRecord {
  id: string;
  matchId: string;
  teamId: string;
  playerIds: string[];
  substitutePlayerIds: string[];
  coachIds: string[];
  captainPlayerId: string | null;
  roleAssignments: Record<string, string>;
}

export interface MatchRecord {
  id: string;
  matchType?: string;
  visibility?: "public" | "private" | "internal";
  officialStatus?: "official" | "unofficial" | "practice";
}

export interface LocationRecord {
  city: string;
  region: string;
  country: string;
}

export interface StoryPeriod {
  period: string;
  displayName: string;
  exactDate: string;
  exactYear: string;
}

export interface PlannedPeriod {
  status: string;
  month: string;
  exactDate: string;
  exactYear: string;
}

export interface CanonUniverse {
  version: KairosVersion;
  collections: Record<string, Array<Record<string, unknown>>>;
  indexes: Record<string, string[]>;
  shared: Record<string, Array<Record<string, unknown>>>;
}
