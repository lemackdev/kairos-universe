import type {
  CanonStatus,
  HistoricalAlias,
  LocationRecord,
} from "@/types/canon";

export interface PublicationManifest {
  enabledGames: string[];
  enabledOrganizations: string[];
  enabledTeams: string[];
  enabledPlayers: string[];
  enabledStaff: string[];
  enabledCompetitions: string[];
  enabledMatches: string[];
  enabledTransfers: string[];
}

export interface SourceView {
  id: string;
  label: string;
  type: string;
  canonStatus: CanonStatus;
  originType: "fictional" | "real-world-reference";
}

export interface EpisodeView {
  id: string;
  number: number;
  title: string;
  date: string | null;
  summary: string;
}

export interface MentorView {
  id: string;
  name: string;
  nickname: string | null;
  role: string;
  playerId: string;
  playerName: string;
  realWorldFigure: boolean;
}

export interface RosterEntryView {
  tenureId: string;
  playerId: string;
  slug: string;
  realName: string;
  nickname: string;
  role: string;
  rosterStatus: string;
  isCaptain: boolean;
  isStarter: boolean;
  joinedDate: string | null;
}

export interface StaffEntryView {
  tenureId: string;
  staffId: string;
  slug: string;
  realName: string;
  nickname: string | null;
  title: string;
  status: string;
  teamScope: string | null;
}

export interface OrganizationView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  originType: "fictional";
  continuityId: "kairos-universe";
  status: string;
  headquarters: LocationRecord | null;
  teamIds: string[];
  philosophy: string[];
  longTermGoals: string[];
  sources: SourceView[];
}

export interface TeamView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  organizationId: string;
  gameId: string;
  gameName: string;
  divisionId: string;
  rosterLevel: string;
  status: string;
  competitiveState: string;
  intendedCompetition: string;
  currentStoryPeriod: string;
  officialDebutPeriod: string;
  captainPlayerId: string;
  trainingLocation: LocationRecord;
  roster: RosterEntryView[];
  staff: StaffEntryView[];
  mentors: MentorView[];
  relatedEpisodes: EpisodeView[];
  sources: SourceView[];
  achievements: string[];
  statistics: Record<string, unknown>;
}

export interface PlayerView {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  displayName: string;
  nationality: string | null;
  city: string | null;
  dateOfBirth: string | null;
  age: number | null;
  gameId: string;
  gameName: string;
  role: string;
  currentTeamId: string;
  currentTeamName: string;
  status: string;
  isCaptain: boolean;
  firstAppearance: EpisodeView | null;
  episodeAppearances: EpisodeView[];
  historicalAliases: HistoricalAlias[];
  teamHistory: RosterEntryView[];
  mentor: MentorView | null;
  statistics: Record<string, unknown>;
  sources: SourceView[];
  canonNotes: string[];
}

export interface StaffView {
  id: string;
  slug: string;
  realName: string;
  nickname: string | null;
  displayName: string;
  nationality: string | null;
  role: string;
  division: string;
  currentOrganizationId: string;
  currentTeamId: string | null;
  status: string;
  firstAppearance: EpisodeView | null;
  episodeAppearances: EpisodeView[];
  realWorldFigure: boolean;
  responsibilities: string[];
  tenures: StaffEntryView[];
  sources: SourceView[];
  canonNotes: string[];
}

export interface GameView {
  id: string;
  slug: string;
  name: string;
  roleVocabulary: string[];
  activeTeamIds: string[];
  activePlayerIds: string[];
  latestEpisodes: EpisodeView[];
}

export type SearchEntityType =
  | "game"
  | "organization"
  | "team"
  | "player"
  | "staff";

export interface SearchRecord {
  id: string;
  slug: string;
  type: SearchEntityType;
  name: string;
  subtitle: string;
  href: string;
  terms: string[];
}

export interface CatalogMetadata {
  canonVersion: string;
  storyEpisode: number;
  storyPeriod: string;
  storyYear: number;
  currentNarrativeDate: string;
  nextCompetitiveMilestone: string;
  generatedAt: string;
  publicationScope: string;
}

export interface KairospediaCatalog {
  metadata: CatalogMetadata;
  games: GameView[];
  organizations: OrganizationView[];
  teams: TeamView[];
  players: PlayerView[];
  staff: StaffView[];
  competitions: [];
  matches: [];
  transfers: [];
  routes: string[];
}
