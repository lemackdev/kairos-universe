import type { CanonStatus } from "@/types/canon";

export type PublicationStatus = "draft" | "published" | "archived";

export type PublicationClassification =
  | "in-universe-publication"
  | "official-announcement"
  | "real-world-reference"
  | "rumor";

export type ArticleType =
  | "news"
  | "interview"
  | "editorial"
  | "feature"
  | "investigation"
  | "press-release"
  | "announcement"
  | "competition-coverage"
  | "analysis"
  | "historical";

export type PublisherCategory =
  | "independent-esports-journalism"
  | "regional-esports"
  | "technology-magazine"
  | "corporate-press-office"
  | "league-communications"
  | "community"
  | "historical-archive";

export type OriginType = "fictional" | "real-world-reference";

export type EntityKind =
  | "organization"
  | "team"
  | "player"
  | "staff"
  | "competition"
  | "game";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "pullQuote"; text: string; attribution: string | null }
  | { type: "list"; style: "bullet" | "numbered"; items: string[] }
  | { type: "image"; path: string; alt: string; caption: string | null; credit: string }
  | {
      type: "embed";
      kind: "video" | "audio" | "external";
      title: string;
      url: string | null;
      availability: "available" | "unavailable" | "not-yet-published";
      note: string | null;
    }
  | { type: "factBox"; title: string; rows: Array<{ label: string; value: string }> };

export interface PublicationCover {
  path: string;
  alt: string;
  width: number;
  height: number;
  credit: string;
}

export interface PublicationCorrection {
  date: string;
  kind: "correction" | "update" | "editors-note";
  text: string;
}

export interface RealWorldCitation {
  title: string;
  publisherName: string;
  url: string | null;
  date: string | null;
}

/** On-disk shapes, validated by schemas/publisher|author|publication.schema.json. */
export interface RawPublisher {
  id: string;
  slug: string;
  continuityId: string;
  name: string;
  shortName: string;
  category: PublisherCategory;
  description: string;
  originType: OriginType;
  realWorldEntity: string | null;
  coverageDisclosure: string | null;
  organizationId: string | null;
  homepage: string | null;
  logoPath: string | null;
  canonStatus: CanonStatus;
  sourceIds: string[];
  notes: string[];
}

export interface RawAuthor {
  id: string;
  slug: string;
  continuityId: string;
  name: string;
  role: string;
  publisherIds: string[];
  bio: string | null;
  originType: OriginType;
  characterId: string | null;
  canonStatus: CanonStatus;
  sourceIds: string[];
  notes: string[];
}

export interface RawPublication {
  id: string;
  slug: string;
  continuityId: string;
  title: string;
  subtitle: string | null;
  publisherId: string;
  authorIds: string[];
  byline: string | null;
  publicationDate: string;
  fictionalWorldDate: string;
  articleType: ArticleType;
  classification: PublicationClassification;
  canonStatus: CanonStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  summary: string;
  content: ContentBlock[];
  cover: PublicationCover | null;
  imageCredits: string[];
  relatedOrganizationIds: string[];
  relatedTeamIds: string[];
  relatedPlayerIds: string[];
  relatedStaffIds: string[];
  relatedCompetitionIds: string[];
  relatedGameIds: string[];
  relatedEpisodeIds: string[];
  relatedPublicationIds: string[];
  sourceIds: string[];
  realWorldCitation: RealWorldCitation | null;
  rumorAuthorization: string | null;
  corrections: PublicationCorrection[];
  tags: string[];
  notes: string[];
  lastUpdated: string;
}

/** Catalog shapes. Only entities published on Kairospedia get an href. */
export interface ResolvedEntity {
  kind: EntityKind;
  id: string;
  label: string;
  href: string | null;
}

export interface PublisherView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: PublisherCategory;
  description: string;
  originType: OriginType;
  realWorldEntity: string | null;
  coverageDisclosure: string | null;
  organization: ResolvedEntity | null;
  homepage: string | null;
  logoPath: string | null;
  articleCount: number;
}

export interface AuthorView {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string | null;
  originType: OriginType;
  publisherIds: string[];
  articleCount: number;
}

export interface PublicationSourceView {
  id: string;
  label: string;
  type: string;
  originType: OriginType;
  canonStatus: CanonStatus;
}

export interface PublicationEpisodeView {
  id: string;
  number: number;
  title: string;
  date: string | null;
}

export interface PublicationRelatedLink {
  id: string;
  slug: string;
  title: string;
  publisherName: string;
  publicationDate: string;
}

export interface PublicationView {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  publisherId: string;
  publisherName: string;
  authorIds: string[];
  bylineText: string;
  publicationDate: string;
  fictionalWorldDate: string;
  articleType: ArticleType;
  classification: PublicationClassification;
  originType: OriginType;
  canonStatus: CanonStatus;
  publicationStatus: PublicationStatus;
  featured: boolean;
  summary: string;
  content: ContentBlock[];
  cover: PublicationCover | null;
  imageCredits: string[];
  /** Resolved targets for every [[kind:id|label]] token and related id. */
  entities: ResolvedEntity[];
  relatedGameIds: string[];
  episodes: PublicationEpisodeView[];
  sources: PublicationSourceView[];
  realWorldCitation: RealWorldCitation | null;
  corrections: PublicationCorrection[];
  tags: string[];
  lastUpdated: string;
  related: PublicationRelatedLink[];
  readingMinutes: number;
}

export interface PublicationCatalog {
  /** True only for local previews with KAIROSPEDIA_PREVIEW_DRAFTS=1. Never set in deployment. */
  includesDrafts: boolean;
  publishers: PublisherView[];
  authors: AuthorView[];
  articles: PublicationView[];
}
