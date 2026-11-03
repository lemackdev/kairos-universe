import path from "node:path";

import type { CanonUniverse } from "@/types/canon";
import type { KairospediaCatalog } from "@/types/catalog";
import type {
  AuthorView,
  EntityKind,
  PublicationCatalog,
  PublicationRelatedLink,
  PublicationView,
  PublisherView,
  RawAuthor,
  RawPublication,
  RawPublisher,
  ResolvedEntity,
} from "@/types/publications";
import { getCollection } from "@/lib/canon/loader";
import { websiteRoot } from "@/lib/canon/paths";

import { bodyWordCount, extractEntityRefs } from "./inline";
import { assertValidPublications } from "./validate";

export interface BuildPublicationOptions {
  includeDrafts?: boolean;
  /** Overridable for tests. Defaults to website/public. */
  publicRoot?: string | null;
}

type Resolver = (kind: EntityKind, id: string) => ResolvedEntity | null;

export function externalEntityIds(catalog: KairospediaCatalog) {
  const scene = catalog.externalScene;
  return {
    organization: new Set(scene?.organizations.map((o) => o.id) ?? []),
    team: new Set(scene?.teams.map((t) => t.id) ?? []),
    player: new Set(scene?.players.map((p) => p.id) ?? []),
  };
}

export function createEntityResolver(catalog: KairospediaCatalog): Resolver {
  const scene = catalog.externalScene;
  const table = new Map<string, ResolvedEntity>();
  const put = (kind: EntityKind, id: string, label: string, href: string) =>
    table.set(`${kind}:${id}`, { kind, id, label, href });

  for (const o of catalog.organizations) put("organization", o.id, o.name, `/wiki/organizations/${o.slug}`);
  for (const o of scene?.organizations ?? []) put("organization", o.id, o.name, `/wiki/organizations/${o.slug}`);
  for (const t of catalog.teams) put("team", t.id, t.name, `/wiki/teams/${t.slug}`);
  for (const t of scene?.teams ?? []) put("team", t.id, t.name, `/wiki/teams/${t.slug}`);
  for (const p of catalog.players) put("player", p.id, p.displayName, `/wiki/players/${p.slug}`);
  for (const p of scene?.players ?? []) put("player", p.id, p.nickname, `/wiki/players/${p.slug}`);
  for (const s of catalog.staff) put("staff", s.id, s.displayName, `/wiki/staff/${s.slug}`);
  for (const c of catalog.competitions) put("competition", c.id, c.name, `/wiki/competitions/${c.slug}`);
  for (const g of catalog.games) put("game", g.id, g.name, `/wiki/games/${g.slug}`);

  return (kind, id) => table.get(`${kind}:${id}`) ?? null;
}

const READING_WPM = 220;

export function buildPublicationCatalog(
  universe: CanonUniverse,
  catalog: KairospediaCatalog,
  options: BuildPublicationOptions = {},
): PublicationCatalog {
  const includeDrafts = options.includeDrafts ?? false;
  const publicRoot =
    options.publicRoot === undefined ? path.join(websiteRoot, "public") : options.publicRoot;

  assertValidPublications({
    universe,
    publicRoot,
    externalIds: externalEntityIds(catalog),
  });

  const resolve = createEntityResolver(catalog);
  const rawPublishers = getCollection<RawPublisher>(universe, "publishers");
  const rawAuthors = getCollection<RawAuthor>(universe, "authors");
  const publisherById = new Map(rawPublishers.map((p) => [p.id, p]));
  const authorById = new Map(rawAuthors.map((a) => [a.id, a]));
  const sourceById = new Map(
    getCollection<{
      id: string;
      publicLabel: string;
      sourceType: string;
      originType: "fictional" | "real-world-reference";
      canonStatus: PublicationView["canonStatus"];
    }>(universe, "sources").map((s) => [s.id, s]),
  );
  const episodeById = new Map(
    getCollection<{ id: string; episodeNumber: number; title: string | null; historicalTitle: string | null; exactStoryDate: string | null }>(
      universe,
      "episodes",
    ).map((e) => [e.id, e]),
  );

  const included = getCollection<RawPublication>(universe, "publications").filter(
    (p) => includeDrafts || p.publicationStatus !== "draft",
  );

  const entitiesFor = (pub: RawPublication): ResolvedEntity[] => {
    const wanted: Array<{ kind: EntityKind; id: string; label?: string }> = [
      ...pub.relatedOrganizationIds.map((id) => ({ kind: "organization" as const, id })),
      ...pub.relatedTeamIds.map((id) => ({ kind: "team" as const, id })),
      ...pub.relatedPlayerIds.map((id) => ({ kind: "player" as const, id })),
      ...pub.relatedStaffIds.map((id) => ({ kind: "staff" as const, id })),
      ...pub.relatedCompetitionIds.map((id) => ({ kind: "competition" as const, id })),
      ...pub.relatedGameIds.map((id) => ({ kind: "game" as const, id })),
      ...extractEntityRefs(pub.content),
    ];
    const seen = new Set<string>();
    const result: ResolvedEntity[] = [];
    for (const item of wanted) {
      const key = `${item.kind}:${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const resolved = resolve(item.kind, item.id);
      if (resolved) {
        result.push(resolved);
      } else if (pub.publicationStatus !== "draft") {
        throw new Error(
          `Publication ${pub.id} references ${item.kind} "${item.id}", which is not published on Kairospedia. Publish that entity first or remove the reference.`,
        );
      } else {
        result.push({ kind: item.kind, id: item.id, label: item.label ?? item.id, href: null });
      }
    }
    return result;
  };

  const articles: PublicationView[] = included.map((pub) => {
    const publisher = publisherById.get(pub.publisherId)!;
    const authors = pub.authorIds.map((id) => authorById.get(id)!);
    const bylineText =
      authors.length > 0 ? authors.map((a) => a.name).join(", ") : (pub.byline ?? publisher.name);
    const words = bodyWordCount(pub.content);

    return {
      id: pub.id,
      slug: pub.slug,
      title: pub.title,
      subtitle: pub.subtitle,
      publisherId: publisher.id,
      publisherName: publisher.name,
      authorIds: pub.authorIds,
      bylineText,
      publicationDate: pub.publicationDate,
      fictionalWorldDate: pub.fictionalWorldDate,
      articleType: pub.articleType,
      classification: pub.classification,
      originType: pub.classification === "real-world-reference" ? "real-world-reference" : "fictional",
      canonStatus: pub.canonStatus,
      publicationStatus: pub.publicationStatus,
      featured: pub.featured,
      summary: pub.summary,
      content: pub.content,
      cover: pub.cover,
      imageCredits: pub.imageCredits,
      entities: entitiesFor(pub),
      relatedGameIds: pub.relatedGameIds,
      episodes: pub.relatedEpisodeIds.map((id) => {
        const episode = episodeById.get(id)!;
        return {
          id,
          number: episode.episodeNumber,
          title: episode.title ?? episode.historicalTitle ?? `Episode ${episode.episodeNumber}`,
          date: episode.exactStoryDate,
        };
      }),
      sources: pub.sourceIds.map((id) => {
        const source = sourceById.get(id)!;
        return {
          id,
          label: source.publicLabel,
          type: source.sourceType,
          originType: source.originType,
          canonStatus: source.canonStatus,
        };
      }),
      realWorldCitation: pub.realWorldCitation,
      corrections: pub.corrections,
      tags: pub.tags,
      lastUpdated: pub.lastUpdated,
      related: [],
      readingMinutes: Math.max(1, Math.round(words / READING_WPM)),
    };
  });

  articles.sort(compareArticles);
  attachRelated(articles, included);

  const usedPublisherIds = new Set(articles.map((a) => a.publisherId));
  const usedAuthorIds = new Set(articles.flatMap((a) => a.authorIds));

  const publishers: PublisherView[] = rawPublishers
    .filter((p) => usedPublisherIds.has(p.id))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortName: p.shortName,
      category: p.category,
      description: p.description,
      originType: p.originType,
      realWorldEntity: p.realWorldEntity,
      coverageDisclosure: p.coverageDisclosure,
      organization: p.organizationId ? resolve("organization", p.organizationId) : null,
      homepage: p.homepage,
      logoPath: p.logoPath,
      articleCount: articles.filter((a) => a.publisherId === p.id).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const authors: AuthorView[] = rawAuthors
    .filter((a) => usedAuthorIds.has(a.id))
    .map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      role: a.role,
      bio: a.bio,
      originType: a.originType,
      publisherIds: a.publisherIds,
      articleCount: articles.filter((x) => x.authorIds.includes(a.id)).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { includesDrafts: includeDrafts, publishers, authors, articles };
}

/** Newest first. Undated drafts sort last. */
function compareArticles(a: PublicationView, b: PublicationView): number {
  const aDated = /^\d{4}-/.test(a.publicationDate);
  const bDated = /^\d{4}-/.test(b.publicationDate);
  if (aDated !== bDated) return aDated ? -1 : 1;
  if (a.publicationDate !== b.publicationDate) return a.publicationDate < b.publicationDate ? 1 : -1;
  return a.title.localeCompare(b.title);
}

function toLink(a: PublicationView): PublicationRelatedLink {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    publisherName: a.publisherName,
    publicationDate: a.publicationDate,
  };
}

/** Declared relations first, then the strongest overlaps by shared entities and tags. */
function attachRelated(articles: PublicationView[], raws: RawPublication[]): void {
  const byId = new Map(articles.map((a) => [a.id, a]));
  const rawById = new Map(raws.map((r) => [r.id, r]));
  const MAX = 4;

  for (const article of articles) {
    const declared = (rawById.get(article.id)?.relatedPublicationIds ?? [])
      .map((id) => byId.get(id))
      .filter((a): a is PublicationView => Boolean(a));
    const taken = new Set([article.id, ...declared.map((a) => a.id)]);
    const entityKeys = new Set(article.entities.map((e) => `${e.kind}:${e.id}`));
    const tags = new Set(article.tags);

    const scored = articles
      .filter((other) => !taken.has(other.id))
      .map((other) => {
        const shared = other.entities.filter((e) => entityKeys.has(`${e.kind}:${e.id}`)).length;
        const sharedTags = other.tags.filter((t) => tags.has(t)).length;
        return { other, score: shared * 2 + sharedTags };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || compareArticles(a.other, b.other));

    article.related = [...declared, ...scored.map((s) => s.other)].slice(0, MAX).map(toLink);
  }
}

export function publicationRoutes(publications: PublicationCatalog): string[] {
  return [
    "/wiki/publications",
    ...publications.articles.map((a) => `/wiki/publications/${a.slug}`),
    ...publications.publishers.map((p) => `/wiki/publications/publishers/${p.slug}`),
  ];
}
