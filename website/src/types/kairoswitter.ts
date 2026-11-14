export type KairoswitterAuthorType = "organization" | "team" | "player" | "staff";

/** A post file in data/kairoswitter/posts/. The text is canon. */
export interface RawKairoswitterPost {
  id: string;
  slug: string;
  continuityId: "kairos-universe";
  authorType: KairoswitterAuthorType;
  authorId: string;
  text: string;
  /** Local date and time of the post, `YYYY-MM-DDTHH:MM`. */
  postedAt: string;
  /** Time zone label of `postedAt`, for example `PT`. */
  timeZone: string;
  /** Story date (`YYYY-MM-DD`); the post is shown only once the narrative date has reached it. */
  storyDate: string;
  episodeIds: string[];
  sourceIds: string[];
  relatedTeamIds: string[];
  relatedPlayerIds: string[];
  relatedStaffIds: string[];
  relatedCompetitionIds: string[];
  pinned: boolean;
  canonStatus: "confirmed";
  notes: string[];
  media?: { src: string; alt: string };
}

export type KairoswitterGroup = "organization" | "management" | "coaches" | "mentors" | "support" | "lol" | "cs";

export const kairoswitterGroupLabels: Record<KairoswitterGroup, string> = {
  organization: "Organization and teams",
  management: "Founder and management",
  coaches: "Coaches",
  mentors: "Mentors",
  support: "Analytics and wellbeing",
  lol: "League of Legends players",
  cs: "Counter-Strike players",
};

export interface KairoswitterAccount {
  key: string;
  handle: string;
  displayName: string;
  type: KairoswitterAuthorType;
  entityId: string;
  /** Page of the entity the account belongs to. */
  href: string;
  organizationId: string | null;
  postCount: number;
  avatarSrc?: string;
  /** Directory group: what the account holder is in the organization. */
  group: KairoswitterGroup;
}

export interface KairoswitterLink {
  label: string;
  href: string;
}

/** A piece of a post's text; `handle` is set when it is a tag of another account. */
export interface KairoswitterTextPart {
  text: string;
  handle?: string;
}

export interface KairoswitterPost {
  id: string;
  slug: string;
  text: string;
  textParts: KairoswitterTextPart[];
  postedAt: string;
  timeZone: string;
  storyDate: string;
  authorKey: string;
  episodeLabels: string[];
  related: KairoswitterLink[];
  pinned: boolean;
  media?: { src: string; alt: string };
}

export interface KairoswitterCatalog {
  narrativeDate: string;
  accounts: KairoswitterAccount[];
  /** Posts visible at the narrative date, newest first. */
  posts: KairoswitterPost[];
  /** Posts dated after the narrative date; kept in the data but not published yet. */
  scheduledCount: number;
  /** Posts that name an image which is not generated yet; they are shown without it. */
  mediaPending: number;
}
