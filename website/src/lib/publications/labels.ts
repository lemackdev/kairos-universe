import type {
  ArticleType,
  PublicationClassification,
  PublisherCategory,
} from "@/types/publications";

export const articleTypeLabels: Record<ArticleType, string> = {
  news: "News",
  interview: "Interview",
  editorial: "Editorial",
  feature: "Feature",
  investigation: "Investigation",
  "press-release": "Press release",
  announcement: "Official announcement",
  "competition-coverage": "Competition coverage",
  analysis: "Industry analysis",
  historical: "Historical",
};

export const articleTypeOrder: ArticleType[] = [
  "news",
  "competition-coverage",
  "interview",
  "feature",
  "analysis",
  "editorial",
  "investigation",
  "press-release",
  "announcement",
  "historical",
];

export const publisherCategoryLabels: Record<PublisherCategory, string> = {
  "independent-esports-journalism": "Independent esports journalism",
  "regional-esports": "Regional esports",
  "technology-magazine": "Technology magazine",
  "corporate-press-office": "Corporate press office",
  "league-communications": "League communications",
  community: "Community publication",
  "historical-archive": "Historical archive",
};

export const classificationLabels: Record<PublicationClassification, string> = {
  "in-universe-publication": "Fictional in-universe publication",
  "official-announcement": "Fictional official announcement",
  "real-world-reference": "Real-world reference",
  rumor: "Unconfirmed rumor",
};

export const classificationNotes: Record<PublicationClassification, string> = {
  "in-universe-publication":
    "This is an original piece of fiction written for the Kairos Universe. It is not real journalism.",
  "official-announcement":
    "This is a fictional announcement within the Kairos Universe. It is not a real statement by any real organization.",
  "real-world-reference":
    "This entry points to real-world published material. Kairospedia summarizes and cites it; it does not reproduce it.",
  rumor:
    "This piece reports unconfirmed speculation inside the fiction. Nothing in it is established canon.",
};

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "3 November 2026". Returns the input unchanged for TBD or malformed values. */
export function formatLongDate(value: string | null | undefined): string {
  if (!value) return "Date to be determined";
  const match = ISO.exec(value);
  if (!match) return value === "TBD" ? "Date to be determined" : value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonthYear(value: string): string {
  const match = ISO.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** "3 Nov 2026" for tight columns. */
export function formatShortDate(value: string): string {
  const match = ISO.exec(value);
  if (!match) return "Undated";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
