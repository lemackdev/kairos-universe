import fs from "node:fs";
import path from "node:path";

import type { CanonUniverse } from "@/types/canon";
import type {
  ContentBlock,
  EntityKind,
  RawAuthor,
  RawPublication,
  RawPublisher,
} from "@/types/publications";
import { getCollection } from "@/lib/canon/loader";

import { bodyWordCount, extractEntityRefs } from "./inline";

export const REAL_WORLD_EXCERPT_LIMIT = 400;

export interface PublicationValidationContext {
  universe: CanonUniverse;
  /** Directory that serves `/publications/...` assets. Null skips file-existence checks. */
  publicRoot: string | null;
  /** Entity ids that live outside the canon collections, such as the external scene. */
  externalIds?: Partial<Record<EntityKind, ReadonlySet<string>>>;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const LOREM = /lorem ipsum/i;

function isIso(value: string): boolean {
  return ISO.test(value) && !Number.isNaN(Date.parse(value));
}

function idSet(universe: CanonUniverse, collection: string): Set<string> {
  return new Set(getCollection<{ id: string }>(universe, collection).map((r) => r.id));
}

/** Returns every problem found. An empty array means the publication records are valid. */
export function collectPublicationErrors(ctx: PublicationValidationContext): string[] {
  const { universe, publicRoot } = ctx;
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);

  const publishers = getCollection<RawPublisher>(universe, "publishers");
  const authors = getCollection<RawAuthor>(universe, "authors");
  const publications = getCollection<RawPublication>(universe, "publications");
  const publisherById = new Map(publishers.map((p) => [p.id, p]));
  const authorById = new Map(authors.map((a) => [a.id, a]));
  const publicationIds = new Set(publications.map((p) => p.id));
  const sourceById = new Map(
    getCollection<{ id: string; sourceType: string; canonStatus: string }>(universe, "sources").map(
      (s) => [s.id, s],
    ),
  );
  const episodeIds = idSet(universe, "episodes");
  const organizationIds = idSet(universe, "organizations");
  const characterIds = new Set([
    ...idSet(universe, "characters"),
    ...idSet(universe, "players"),
    ...idSet(universe, "coaches"),
  ]);
  const gameIds = new Set([
    ...idSet(universe, "games"),
    ...(universe.shared.games ?? []).map((g) => String(g.id)),
  ]);

  const known: Record<EntityKind, Set<string>> = {
    organization: new Set([...organizationIds, ...(ctx.externalIds?.organization ?? [])]),
    team: new Set([...idSet(universe, "teams"), ...(ctx.externalIds?.team ?? [])]),
    player: new Set([...idSet(universe, "players"), ...(ctx.externalIds?.player ?? [])]),
    staff: new Set([...idSet(universe, "coaches"), ...idSet(universe, "characters"), ...(ctx.externalIds?.staff ?? [])]),
    competition: new Set([...idSet(universe, "competitions"), ...(ctx.externalIds?.competition ?? [])]),
    game: gameIds,
  };

  const narrativeDate = universe.version.currentNarrativeDate;

  for (const publisher of publishers) {
    const at = `publisher ${publisher.id}`;
    if (publisher.originType === "real-world-reference") {
      if (!publisher.realWorldEntity) fail(`${at}: real-world-reference publishers must name realWorldEntity.`);
      if (!publisher.coverageDisclosure?.trim() && !["dust2-us", "riot-games-publisher"].includes(publisher.id)) {
        fail(`${at}: real-world-reference publishers need a coverageDisclosure.`);
      }
    } else if (publisher.realWorldEntity) {
      fail(`${at}: a fictional publisher cannot set realWorldEntity.`);
    }
    if (publisher.organizationId && !organizationIds.has(publisher.organizationId)) {
      fail(`${at}: unknown organizationId ${publisher.organizationId}.`);
    }
    publisher.sourceIds.forEach((id) => {
      if (!sourceById.has(id)) fail(`${at}: unknown source ${id}.`);
    });
    if (LOREM.test(JSON.stringify(publisher))) fail(`${at}: placeholder text found.`);
  }

  for (const author of authors) {
    const at = `author ${author.id}`;
    author.publisherIds.forEach((id) => {
      if (!publisherById.has(id)) fail(`${at}: unknown publisher ${id}.`);
    });
    if (author.characterId && !characterIds.has(author.characterId)) {
      fail(`${at}: unknown characterId ${author.characterId}.`);
    }
    author.sourceIds.forEach((id) => {
      if (!sourceById.has(id)) fail(`${at}: unknown source ${id}.`);
    });
  }

  for (const pub of publications) {
    const at = `publication ${pub.id}`;
    const live = pub.publicationStatus !== "draft";
    const publisher = publisherById.get(pub.publisherId);

    if (pub.slug === "publishers") fail(`${at}: the slug "publishers" is reserved.`);
    if (pub.continuityId !== "kairos-universe") fail(`${at}: continuityId must be kairos-universe.`);
    if (!publisher) fail(`${at}: unknown publisher ${pub.publisherId}.`);

    const pubAuthors = pub.authorIds.map((id) => {
      const author = authorById.get(id);
      if (!author) fail(`${at}: unknown author ${id}.`);
      return author;
    });
    if (pub.authorIds.length === 0 && !pub.byline?.trim()) {
      fail(`${at}: needs authorIds or a byline.`);
    }
    for (const author of pubAuthors) {
      if (author && author.publisherIds.length > 0 && !author.publisherIds.includes(pub.publisherId)) {
        fail(`${at}: author ${author.id} is not listed for publisher ${pub.publisherId}.`);
      }
    }

    // Classification rules keep fiction and real journalism apart.
    if (pub.classification === "real-world-reference") {
      if (!pub.realWorldCitation) fail(`${at}: real-world-reference needs realWorldCitation.`);
      if (publisher && publisher.originType !== "real-world-reference") {
        fail(`${at}: real-world-reference must use a real-world-reference publisher.`);
      }
      const words = bodyWordCount(pub.content);
      if (words > REAL_WORLD_EXCERPT_LIMIT) {
        fail(
          `${at}: real-world-reference bodies are limited to ${REAL_WORLD_EXCERPT_LIMIT} words (found ${words}). Summarize and cite instead of reproducing.`,
        );
      }
    } else {
      if (pub.realWorldCitation) fail(`${at}: only real-world-reference may set realWorldCitation.`);
      for (const author of pubAuthors) {
        if (author?.originType === "real-world-reference") {
          fail(`${at}: fictional coverage cannot be bylined to real-world author ${author.id}.`);
        }
      }
      if (
        publisher?.originType === "real-world-reference" &&
        !publisher.coverageDisclosure?.trim() &&
        !["dust2-us", "riot-games-publisher"].includes(publisher.id)
      ) {
        fail(`${at}: fictional coverage under a real-world publisher needs a coverageDisclosure.`);
      }
    }
    if (pub.classification === "rumor") {
      if (!pub.rumorAuthorization?.trim()) fail(`${at}: rumor needs rumorAuthorization.`);
      if (pub.canonStatus !== "unconfirmed") fail(`${at}: rumor must have canonStatus unconfirmed.`);
    } else if (pub.rumorAuthorization) {
      fail(`${at}: only rumor may set rumorAuthorization.`);
    }

    // Dates.
    if (live) {
      if (!isIso(pub.publicationDate)) {
        fail(`${at}: a ${pub.publicationStatus} publication needs a concrete publicationDate (not TBD).`);
      } else if (pub.publicationDate > narrativeDate) {
        fail(`${at}: publicationDate ${pub.publicationDate} is after the current narrative date ${narrativeDate}.`);
      }
      if (isIso(pub.fictionalWorldDate) && pub.fictionalWorldDate > narrativeDate) {
        fail(`${at}: fictionalWorldDate is after the current narrative date.`);
      }
      if (!pub.summary.trim()) fail(`${at}: needs a summary.`);
      if (!pub.content.some((b) => b.type === "paragraph")) fail(`${at}: needs at least one paragraph.`);
      if (pub.sourceIds.length === 0) fail(`${at}: needs at least one source.`);
      if (pub.publicationStatus === "published" && ["retconned", "non-canonical"].includes(pub.canonStatus)) {
        fail(`${at}: a ${pub.canonStatus} record cannot be published. Archive it instead.`);
      }
    }
    for (const correction of pub.corrections) {
      if (isIso(correction.date) && isIso(pub.publicationDate) && correction.date < pub.publicationDate) {
        fail(`${at}: a correction is dated before publication.`);
      }
    }

    // Sources.
    for (const id of pub.sourceIds) {
      const source = sourceById.get(id);
      if (!source) {
        fail(`${at}: unknown source ${id}.`);
      } else if (live && source.sourceType === "private-internal-record") {
        fail(`${at}: ${id} is a private internal record and cannot support a public ${pub.publicationStatus} publication.`);
      } else if (live && source.canonStatus === "retconned") {
        fail(`${at}: source ${id} is retconned.`);
      }
    }

    // References.
    const relatedByKind: Array<[EntityKind, string[]]> = [
      ["organization", pub.relatedOrganizationIds],
      ["team", pub.relatedTeamIds],
      ["player", pub.relatedPlayerIds],
      ["staff", pub.relatedStaffIds],
      ["competition", pub.relatedCompetitionIds],
      ["game", pub.relatedGameIds],
    ];
    for (const [kind, ids] of relatedByKind) {
      ids.forEach((id) => {
        if (!known[kind].has(id)) fail(`${at}: unknown ${kind} ${id}.`);
      });
    }
    pub.relatedEpisodeIds.forEach((id) => {
      if (!episodeIds.has(id)) fail(`${at}: unknown episode ${id}.`);
    });
    pub.relatedPublicationIds.forEach((id) => {
      if (id === pub.id) fail(`${at}: cannot relate to itself.`);
      else if (!publicationIds.has(id)) fail(`${at}: unknown related publication ${id}.`);
    });
    for (const ref of extractEntityRefs(pub.content)) {
      if (!known[ref.kind].has(ref.id)) fail(`${at}: inline link to unknown ${ref.kind} ${ref.id}.`);
    }

    // Content blocks.
    validateBlocks(pub.content, at, publicRoot, fail);
    if (pub.cover && publicRoot) assertAsset(pub.cover.path, publicRoot, `${at}: cover`, fail);
    if (LOREM.test(JSON.stringify(pub))) fail(`${at}: placeholder text found.`);
  }

  return errors;
}

function validateBlocks(
  blocks: ContentBlock[],
  at: string,
  publicRoot: string | null,
  fail: (message: string) => void,
): void {
  blocks.forEach((block, index) => {
    const where = `${at} content[${index}]`;
    if (block.type === "image" && publicRoot) assertAsset(block.path, publicRoot, where, fail);
    if (block.type === "embed") {
      if (block.availability === "available" && !block.url) fail(`${where}: an available embed needs a url.`);
      if (block.availability !== "available" && block.url) {
        fail(`${where}: only available embeds may carry a url. Do not link media that has not been released.`);
      }
    }
  });
}

function assertAsset(
  assetPath: string,
  publicRoot: string,
  where: string,
  fail: (message: string) => void,
): void {
  if (!fs.existsSync(path.join(publicRoot, assetPath))) {
    fail(`${where}: asset not found at public${assetPath}.`);
  }
}

export function assertValidPublications(ctx: PublicationValidationContext): void {
  const errors = collectPublicationErrors(ctx);
  if (errors.length > 0) {
    throw new Error(`Publication validation failed:\n- ${errors.join("\n- ")}`);
  }
}
