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
  nationality?: string | null;
  nationalities?: string[];
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
  leftDate: string | null;
  contractEndDate: string | null;
  teamId: string;
  teamName: string;
  teamSlug: string | null;
}

export interface StaffEntryView {
  tenureId: string;
  staffId: string;
  slug: string;
  realName: string;
  nickname: string | null;
  nationality: string | null;
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
  ownerName: string | null;
  ownerSlug: string | null;
  founded: string | null;
  teamIds: string[];
  management: StaffView[];
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
  headCoachName: string | null;
  trainingLocation: LocationRecord;
  roster: RosterEntryView[];
  formerRoster: RosterEntryView[];
  officialMatchCount: number;
  history: string[];
  timeline: EpisodeView[];
  staff: StaffEntryView[];
  mentors: MentorView[];
  relatedEpisodes: EpisodeView[];
  sources: SourceView[];
  achievements: string[];
  statistics: Record<string, unknown>;
}

export interface PlayerView {
  nationalities?: string[];
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  displayName: string;
  nationality: string | null;
  city: string | null;
  cityRegion: string | null;
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
  trivia: string[];
  awards: AwardView[];
  tournamentResults: TournamentResultView[];
  officialMatchCount: number;
  mentor: MentorView | null;
  statistics: Record<string, unknown>;
  sources: SourceView[];
  canonNotes: string[];
}

export interface AwardView {
  id: string;
  name: string;
  date: string | null;
  recipientName: string;
  recipientHref: string | null;
  competitionName: string | null;
  sources: SourceView[];
}

export interface TournamentResultView {
  id: string;
  competitionName: string;
  competitionSlug: string;
  teamName: string;
  teamSlug: string | null;
  place: number | null;
  date: string | null;
}

export interface CompetitionView {
  id: string;
  slug: string;
  name: string;
  gameId: string;
  gameName: string;
  status: string;
  overview: string | null;
  format: string[];
  organizer: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  prizePool: string | null;
  prizes: Array<{ place: string; prize: string | null; teamName: string | null }>;
  participants: Array<{ id: string; name: string; slug: string }>;
  results: TournamentResultView[];
  awards: AwardView[];
  sources: SourceView[];
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
  | "staff"
  | "competition";

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
  externalScene?: import("./external-scene").ExternalScene;
  metadata: CatalogMetadata;
  games: GameView[];
  organizations: OrganizationView[];
  teams: TeamView[];
  players: PlayerView[];
  staff: StaffView[];
  competitions: CompetitionView[];
  matches: [];
  transfers: [];
  routes: string[];
}
