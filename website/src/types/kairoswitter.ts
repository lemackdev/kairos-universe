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
}

export interface KairoswitterLink {
  label: string;
  href: string;
}

export interface KairoswitterPost {
  id: string;
  slug: string;
  text: string;
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
