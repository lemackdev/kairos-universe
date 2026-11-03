import type { ArticleType, PublicationView } from "@/types/publications";
import { normalizeSearch } from "@/lib/search/search";

/** The slice of a publication the archive list needs. The full body is never sent to the client. */
export interface PublicationListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  publisherId: string;
  publisherName: string;
  bylineText: string;
  articleType: ArticleType;
  classification: PublicationView["classification"];
  publicationDate: string;
  fictionalWorldDate: string;
  featured: boolean;
  status: PublicationView["publicationStatus"];
  coverPath: string | null;
  coverAlt: string | null;
  readingMinutes: number;
  tags: string[];
  entities: Array<{ key: string; kind: string; label: string }>;
}

export function toListItem(article: PublicationView): PublicationListItem {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    summary: article.summary,
    publisherId: article.publisherId,
    publisherName: article.publisherName,
    bylineText: article.bylineText,
    articleType: article.articleType,
    classification: article.classification,
    publicationDate: article.publicationDate,
    fictionalWorldDate: article.fictionalWorldDate,
    featured: article.featured,
    status: article.publicationStatus,
    coverPath: article.cover?.path ?? null,
    coverAlt: article.cover?.alt ?? null,
    readingMinutes: article.readingMinutes,
    tags: article.tags,
    entities: article.entities.map((e) => ({ key: `${e.kind}:${e.id}`, kind: e.kind, label: e.label })),
  };
}

export interface ArchiveFilters {
  query: string;
  type: ArticleType | "";
  publisherId: string;
  entityKey: string;
  from: string;
  to: string;
}

export const emptyFilters: ArchiveFilters = {
  query: "",
  type: "",
  publisherId: "",
  entityKey: "",
  from: "",
  to: "",
};

export function hasActiveFilters(filters: ArchiveFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== "");
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function filterPublications(
  items: PublicationListItem[],
  filters: ArchiveFilters,
): PublicationListItem[] {
  const query = normalizeSearch(filters.query.trim());
  return items.filter((item) => {
    if (filters.type && item.articleType !== filters.type) return false;
    if (filters.publisherId && item.publisherId !== filters.publisherId) return false;
    if (filters.entityKey && !item.entities.some((e) => e.key === filters.entityKey)) return false;
    if (filters.from || filters.to) {
      // Undated items have no place on a timeline, so a date filter excludes them.
      if (!ISO.test(item.publicationDate)) return false;
      if (filters.from && item.publicationDate < filters.from) return false;
      if (filters.to && item.publicationDate > filters.to) return false;
    }
    if (query) {
      const haystack = normalizeSearch(
        [
          item.title,
          item.subtitle ?? "",
          item.summary,
          item.publisherName,
          item.bylineText,
          ...item.tags,
          ...item.entities.map((e) => e.label),
        ].join(" \n "),
      );
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export interface MonthGroup {
  /** "2026-11" or "undated". */
  key: string;
  items: PublicationListItem[];
}

/** Groups items (already newest first) under their month. */
export function groupByMonth(items: PublicationListItem[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const item of items) {
    const key = ISO.test(item.publicationDate) ? item.publicationDate.slice(0, 7) : "undated";
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}

/** The explicitly featured story, else the newest. Items arrive newest first. */
export function pickFeatured(items: PublicationListItem[]): PublicationListItem | null {
  return items.find((i) => i.featured) ?? items[0] ?? null;
}
