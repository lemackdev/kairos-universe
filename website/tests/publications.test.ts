import fs from "node:fs";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { CanonUniverse } from "@/types/canon";
import type { KairospediaCatalog } from "@/types/catalog";
import type {
  RawAuthor,
  RawPublication,
  RawPublisher,
} from "@/types/publications";
import { buildCatalog } from "@/lib/catalog/build";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { repositoryRoot } from "@/lib/canon/paths";
import {
  emptyFilters,
  filterPublications,
  groupByMonth,
  pickFeatured,
  toListItem,
} from "@/lib/publications/filter";
import {
  bodyWordCount,
  extractEntityRefs,
  parseInline,
  plainText,
} from "@/lib/publications/inline";
import { buildOutline } from "@/lib/publications/outline";
import { formatLongDate } from "@/lib/publications/labels";
import {
  buildPublicationCatalog,
  publicationRoutes,
} from "@/lib/publications/build";
import {
  collectPublicationErrors,
  REAL_WORLD_EXCERPT_LIMIT,
} from "@/lib/publications/validate";
import { buildSearchRecords } from "@/lib/search/build";

let base: CanonUniverse;
let catalog: KairospediaCatalog;
let narrativeDate: string;
let sourceId: string;
let episodeId: string;

beforeAll(() => {
  base = loadCanonUniverse();
  catalog = buildCatalog(base, loadPublicationManifest());
  narrativeDate = base.version.currentNarrativeDate;
  const source = base.collections.sources!.find(
    (s) => s.sourceType !== "private-internal-record" && s.canonStatus === "confirmed",
  );
  sourceId = String(source!.id);
  episodeId = String(base.collections.episodes![0]!.id);
});

function publisher(over: Partial<RawPublisher> = {}): RawPublisher {
  return {
    id: "fixture-wire",
    slug: "fixture-wire",
    continuityId: "kairos-universe",
    name: "Fixture Wire",
    shortName: "Wire",
    category: "independent-esports-journalism",
    description: "A test outlet used only by unit tests.",
    originType: "fictional",
    realWorldEntity: null,
    coverageDisclosure: null,
    organizationId: null,
    homepage: null,
    logoPath: null,
    canonStatus: "confirmed",
    sourceIds: [],
    notes: [],
    ...over,
  };
}

function author(over: Partial<RawAuthor> = {}): RawAuthor {
  return {
    id: "fixture-writer",
    slug: "fixture-writer",
    continuityId: "kairos-universe",
    name: "Fixture Writer",
    role: "Staff writer",
    publisherIds: ["fixture-wire"],
    bio: null,
    originType: "fictional",
    characterId: null,
    canonStatus: "confirmed",
    sourceIds: [],
    notes: [],
    ...over,
  };
}

function publication(over: Partial<RawPublication> = {}): RawPublication {
  return {
    id: "fixture-story",
    slug: "fixture-story",
    continuityId: "kairos-universe",
    title: "A fixture headline",
    subtitle: "A fixture deck",
    publisherId: "fixture-wire",
    authorIds: ["fixture-writer"],
    byline: null,
    publicationDate: narrativeDate,
    fictionalWorldDate: narrativeDate,
    articleType: "news",
    classification: "in-universe-publication",
    canonStatus: "confirmed",
    publicationStatus: "published",
    featured: false,
    summary: "A fixture summary.",
    content: [
      { type: "paragraph", text: "Opening paragraph about [[team:kairos-lol-main|Kairos Gaming]]." },
      { type: "heading", level: 2, text: "Second section" },
      { type: "paragraph", text: "More text." },
    ],
    cover: null,
    imageCredits: [],
    relatedOrganizationIds: ["kairos-esports"],
    relatedTeamIds: [],
    relatedPlayerIds: [],
    relatedStaffIds: [],
    relatedCompetitionIds: [],
    relatedGameIds: [],
    relatedEpisodeIds: [episodeId],
    relatedPublicationIds: [],
    sourceIds: [sourceId],
    realWorldCitation: null,
    rumorAuthorization: null,
    corrections: [],
    tags: [],
    notes: [],
    lastUpdated: "2026-11-03",
    ...over,
  };
}

function universeWith(records: {
  publishers?: RawPublisher[];
  authors?: RawAuthor[];
  publications?: RawPublication[];
  extraSources?: Array<Record<string, unknown>>;
}): CanonUniverse {
  return {
    ...base,
    collections: {
      ...base.collections,
      sources: [...(base.collections.sources ?? []), ...(records.extraSources ?? [])],
      publishers: (records.publishers ?? []) as unknown as Array<Record<string, unknown>>,
      authors: (records.authors ?? []) as unknown as Array<Record<string, unknown>>,
      publications: (records.publications ?? []) as unknown as Array<Record<string, unknown>>,
    },
  };
}

const errorsFor = (universe: CanonUniverse) =>
  collectPublicationErrors({ universe, publicRoot: null });

describe("repository publication data", () => {
  it("is valid as committed", () => {
    expect(errorsFor(base)).toEqual([]);
  });

  it("builds a catalog and routes from the committed records", () => {
    const built = buildPublicationCatalog(base, catalog, { publicRoot: null });
    expect(publicationRoutes(built)).toContain("/wiki/publications");
    expect(built.includesDrafts).toBe(false);
    expect(built.articles.every((a) => a.publicationStatus !== "draft")).toBe(true);
  });
});

describe("inline entity links", () => {
  it("splits tokens from text", () => {
    expect(parseInline("See [[team:kairos-lol-main|Kairos Gaming]] today")).toEqual([
      { type: "text", text: "See " },
      { type: "entity", kind: "team", id: "kairos-lol-main", label: "Kairos Gaming" },
      { type: "text", text: " today" },
    ]);
  });

  it("ignores malformed tokens", () => {
    expect(parseInline("[[team:Bad Id|x]] and [[robot:a|b]]")).toEqual([
      { type: "text", text: "[[team:Bad Id|x]] and [[robot:a|b]]" },
    ]);
  });

  it("flattens to labels and counts words without token syntax", () => {
    expect(plainText("About [[player:daniel-moss-reyes|Moss]].")).toBe("About Moss.");
    expect(bodyWordCount([{ type: "paragraph", text: "One [[team:kairos-lol-main|Two Three]] four" }])).toBe(4);
  });

  it("extracts references from every block type", () => {
    const refs = extractEntityRefs([
      { type: "pullQuote", text: "Quote [[player:a-b|A]]", attribution: "Said [[staff:c-d|C]]" },
      { type: "list", style: "bullet", items: ["[[game:league-of-legends|LoL]]"] },
    ]);
    expect(refs.map((r) => `${r.kind}:${r.id}`)).toEqual(["player:a-b", "staff:c-d", "game:league-of-legends"]);
  });

  it("builds unique heading anchors", () => {
    const outline = buildOutline([
      { type: "heading", level: 2, text: "Results" },
      { type: "paragraph", text: "x" },
      { type: "heading", level: 2, text: "Results" },
      { type: "heading", level: 3, text: "Café notes" },
    ]);
    expect(outline.map((o) => o.id)).toEqual(["results", "results-2", "cafe-notes"]);
  });
});

describe("validation", () => {
  const valid = () => universeWith({ publishers: [publisher()], authors: [author()], publications: [publication()] });

  it("accepts a well-formed published article", () => {
    expect(errorsFor(valid())).toEqual([]);
  });

  it("accepts a draft with no date", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ publicationStatus: "draft", publicationDate: "TBD", fictionalWorldDate: "TBD", sourceIds: [] })],
    });
    expect(errorsFor(u)).toEqual([]);
  });

  it("rejects published articles without a concrete date", () => {
    const u = universeWith({ publishers: [publisher()], authors: [author()], publications: [publication({ publicationDate: "TBD" })] });
    expect(errorsFor(u).join("\n")).toMatch(/concrete publicationDate/);
  });

  it("rejects publication dates after the current narrative date", () => {
    const u = universeWith({ publishers: [publisher()], authors: [author()], publications: [publication({ publicationDate: "2099-01-01" })] });
    expect(errorsFor(u).join("\n")).toMatch(/after the current narrative date/);
  });

  it("rejects private internal records as public sources", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ sourceIds: ["source-fixture-private"] })],
      extraSources: [{ id: "source-fixture-private", sourceType: "private-internal-record", canonStatus: "confirmed" }],
    });
    expect(errorsFor(u).join("\n")).toMatch(/private internal record/);
  });

  it("allows private sources on drafts only", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ publicationStatus: "draft", sourceIds: ["source-fixture-private"] })],
      extraSources: [{ id: "source-fixture-private", sourceType: "private-internal-record", canonStatus: "confirmed" }],
    });
    expect(errorsFor(u)).toEqual([]);
  });

  it("requires authorization and unconfirmed status for rumors", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ classification: "rumor" })],
    });
    const text = errorsFor(u).join("\n");
    expect(text).toMatch(/needs rumorAuthorization/);
    expect(text).toMatch(/canonStatus unconfirmed/);
  });

  it("never lets fictional coverage carry a real-world byline", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author({ originType: "real-world-reference" })],
      publications: [publication()],
    });
    expect(errorsFor(u).join("\n")).toMatch(/cannot be bylined to real-world author/);
  });

  it("requires a disclosure when a real-world publisher is portrayed", () => {
    const u = universeWith({
      publishers: [publisher({ originType: "real-world-reference", realWorldEntity: "Example Outlet", coverageDisclosure: null })],
      authors: [author()],
      publications: [publication()],
    });
    const text = errorsFor(u).join("\n");
    expect(text).toMatch(/need a coverageDisclosure/);
    expect(text).toMatch(/needs a coverageDisclosure/);
  });

  it("holds real-world references to citations and short excerpts", () => {
    const longBody = Array.from({ length: REAL_WORLD_EXCERPT_LIMIT + 1 }, () => "word").join(" ");
    const u = universeWith({
      publishers: [publisher({ originType: "real-world-reference", realWorldEntity: "Example Outlet", coverageDisclosure: "Real outlet." })],
      authors: [],
      publications: [
        publication({
          classification: "real-world-reference",
          authorIds: [],
          byline: "Example Outlet",
          content: [{ type: "paragraph", text: longBody }],
        }),
      ],
    });
    const text = errorsFor(u).join("\n");
    expect(text).toMatch(/needs realWorldCitation/);
    expect(text).toMatch(/limited to 400 words/);
  });

  it("rejects unknown references, inline links, and reserved slugs", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [
        publication({
          slug: "publishers",
          relatedTeamIds: ["no-such-team"],
          content: [{ type: "paragraph", text: "See [[player:no-such-player|Nobody]]." }],
        }),
      ],
    });
    const text = errorsFor(u).join("\n");
    expect(text).toMatch(/unknown team no-such-team/);
    expect(text).toMatch(/inline link to unknown player/);
    expect(text).toMatch(/reserved/);
  });

  it("refuses to link media that has not been released", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [
        publication({
          content: [
            { type: "paragraph", text: "Body." },
            { type: "embed", kind: "video", title: "Interview", url: "https://example.com/v", availability: "not-yet-published", note: null },
          ],
        }),
      ],
    });
    expect(errorsFor(u).join("\n")).toMatch(/Do not link media that has not been released/);
  });

  it("requires a byline or authors and flags placeholder text", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ authorIds: [], byline: null, summary: "Lorem ipsum dolor." })],
    });
    const text = errorsFor(u).join("\n");
    expect(text).toMatch(/needs authorIds or a byline/);
    expect(text).toMatch(/placeholder text/);
  });
});

describe("schemas", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false, allowUnionTypes: true });
  beforeAll(() => {
    const dir = path.join(repositoryRoot, "schemas");
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith(".schema.json"))) {
      ajv.addSchema(JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")));
    }
  });
  const get = (name: string) => ajv.getSchema(`https://kairos-universe.local/schemas/${name}.schema.json`)!;

  it("accepts the fixture records", () => {
    expect(get("publisher")(publisher())).toBe(true);
    expect(get("author")(author())).toBe(true);
    const validate = get("publication");
    expect(validate(publication())).toBe(true);
  });

  it("rejects unknown statuses, block types, and extra fields", () => {
    const validate = get("publication");
    expect(validate({ ...publication(), publicationStatus: "scheduled" })).toBe(false);
    expect(validate({ ...publication(), content: [{ type: "script", text: "x" }] })).toBe(false);
    expect(validate({ ...publication(), surprise: true })).toBe(false);
  });
});

describe("catalog build", () => {
  const records = () => ({
    publishers: [publisher()],
    authors: [author()],
    publications: [
      publication({ id: "fixture-newer", slug: "fixture-newer", title: "Newer", publicationDate: narrativeDate, tags: ["kairos"] }),
      publication({ id: "fixture-older", slug: "fixture-older", title: "Older", publicationDate: "2026-11-01", fictionalWorldDate: "2026-11-01", tags: ["kairos"] }),
      publication({ id: "fixture-draft", slug: "fixture-draft", title: "Draft", publicationStatus: "draft", publicationDate: "TBD", fictionalWorldDate: "TBD" }),
    ],
  });

  it("excludes drafts from the public catalog and sorts newest first", () => {
    const built = buildPublicationCatalog(universeWith(records()), catalog, { publicRoot: null });
    expect(built.articles.map((a) => a.id)).toEqual(["fixture-newer", "fixture-older"]);
    expect(built.publishers.map((p) => p.id)).toEqual(["fixture-wire"]);
    expect(JSON.stringify(built)).not.toContain("fixture-draft");
  });

  it("includes drafts only when explicitly previewing, undated last", () => {
    const built = buildPublicationCatalog(universeWith(records()), catalog, { includeDrafts: true, publicRoot: null });
    expect(built.includesDrafts).toBe(true);
    expect(built.articles.map((a) => a.id)).toEqual(["fixture-newer", "fixture-older", "fixture-draft"]);
  });

  it("hides publishers and authors that only have drafts", () => {
    const u = universeWith({
      publishers: [publisher(), publisher({ id: "fixture-hidden", slug: "fixture-hidden", name: "Hidden Outlet" })],
      authors: [author(), author({ id: "fixture-hidden-writer", slug: "fixture-hidden-writer", name: "Hidden Writer", publisherIds: ["fixture-hidden"] })],
      publications: [
        publication(),
        publication({ id: "fixture-secret", slug: "fixture-secret", publisherId: "fixture-hidden", authorIds: ["fixture-hidden-writer"], publicationStatus: "draft" }),
      ],
    });
    const built = buildPublicationCatalog(u, catalog, { publicRoot: null });
    expect(JSON.stringify(built)).not.toMatch(/Hidden Outlet|Hidden Writer/);
  });

  it("resolves inline and related entities to published Kairospedia routes", () => {
    const built = buildPublicationCatalog(universeWith(records()), catalog, { publicRoot: null });
    const entities = built.articles[0]!.entities;
    expect(entities.find((e) => e.kind === "team" && e.id === "kairos-lol-main")?.href).toMatch(/^\/wiki\/teams\//);
    expect(entities.find((e) => e.kind === "organization" && e.id === "kairos-esports")?.href).toBe(
      "/wiki/organizations/kairos-esports",
    );
  });

  it("fails loudly when a published article references an unpublished entity", () => {
    // Asterion exists in canon but has no Kairospedia page, so a live article cannot link to it yet.
    expect(catalog.organizations.some((o) => o.id === "asterion-intelligence")).toBe(false);
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ relatedOrganizationIds: ["asterion-intelligence"] })],
    });
    expect(() => buildPublicationCatalog(u, catalog, { publicRoot: null })).toThrow(
      /asterion-intelligence.*not published on Kairospedia/,
    );
  });

  it("lets a draft mention an unpublished entity without a link", () => {
    const u = universeWith({
      publishers: [publisher()],
      authors: [author()],
      publications: [publication({ publicationStatus: "draft", relatedOrganizationIds: ["asterion-intelligence"] })],
    });
    const built = buildPublicationCatalog(u, catalog, { includeDrafts: true, publicRoot: null });
    expect(built.articles[0]!.entities.find((e) => e.id === "asterion-intelligence")?.href).toBeNull();
  });

  it("links related stories by declared relation, then shared entities", () => {
    const built = buildPublicationCatalog(universeWith(records()), catalog, { publicRoot: null });
    const newer = built.articles.find((a) => a.id === "fixture-newer")!;
    expect(newer.related.map((r) => r.id)).toContain("fixture-older");
    expect(newer.related.map((r) => r.id)).not.toContain("fixture-newer");
  });

  it("adds published articles to the search index and routes", () => {
    const built = buildPublicationCatalog(universeWith(records()), catalog, { publicRoot: null });
    const search = buildSearchRecords({ ...catalog, publications: built }).filter((r) => r.type === "publication");
    expect(search.map((r) => r.href).sort()).toEqual(["/wiki/publications/fixture-newer", "/wiki/publications/fixture-older"]);
    expect(publicationRoutes(built)).toEqual([
      "/wiki/publications",
      "/wiki/publications/fixture-newer",
      "/wiki/publications/fixture-older",
      "/wiki/publications/publishers/fixture-wire",
    ]);
  });
});

describe("archive filtering", () => {
  const items = () => {
    const built = buildPublicationCatalog(
      universeWith({
        publishers: [publisher(), publisher({ id: "fixture-two", slug: "fixture-two", name: "Second Outlet" })],
        authors: [author(), author({ id: "fixture-writer-2", slug: "fixture-writer-2", name: "Second Writer", publisherIds: ["fixture-two"] })],
        publications: [
          publication({ id: "p-a", slug: "p-a", title: "Moss returns to the stage", publicationDate: "2026-12-10", fictionalWorldDate: "2026-12-10", articleType: "interview", featured: true }),
          publication({ id: "p-b", slug: "p-b", title: "Roster notes", publicationDate: "2026-12-02", fictionalWorldDate: "2026-12-02", publisherId: "fixture-two", authorIds: ["fixture-writer-2"] }),
          publication({ id: "p-c", slug: "p-c", title: "Autumn recap", publicationDate: "2026-11-05", fictionalWorldDate: "2026-11-05", articleType: "analysis" }),
        ],
      }),
      catalog,
      { publicRoot: null },
    );
    return built.articles.map(toListItem);
  };

  it("filters by text, type, publisher, entity, and date range", () => {
    const all = items();
    expect(filterPublications(all, { ...emptyFilters, query: "moss" }).map((i) => i.id)).toEqual(["p-a"]);
    expect(filterPublications(all, { ...emptyFilters, type: "analysis" }).map((i) => i.id)).toEqual(["p-c"]);
    expect(filterPublications(all, { ...emptyFilters, publisherId: "fixture-two" }).map((i) => i.id)).toEqual(["p-b"]);
    expect(filterPublications(all, { ...emptyFilters, entityKey: "organization:kairos-esports" })).toHaveLength(3);
    expect(filterPublications(all, { ...emptyFilters, from: "2026-12-01" }).map((i) => i.id)).toEqual(["p-a", "p-b"]);
    expect(filterPublications(all, { ...emptyFilters, to: "2026-11-30" }).map((i) => i.id)).toEqual(["p-c"]);
  });

  it("groups by month and picks the explicitly featured story", () => {
    const all = items();
    expect(groupByMonth(all).map((g) => [g.key, g.items.length])).toEqual([
      ["2026-12", 2],
      ["2026-11", 1],
    ]);
    expect(pickFeatured(all)?.id).toBe("p-a");
    expect(pickFeatured(all.filter((i) => !i.featured))?.id).toBe("p-b");
    expect(pickFeatured([])).toBeNull();
  });

  it("does not ship article bodies to the client list", () => {
    expect(JSON.stringify(items())).not.toContain("Opening paragraph");
  });
});

describe("formatting", () => {
  it("formats in-universe dates without timezone drift", () => {
    expect(formatLongDate("2026-11-03")).toBe("3 November 2026");
    expect(formatLongDate("TBD")).toBe("Date to be determined");
  });
});
