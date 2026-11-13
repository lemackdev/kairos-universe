import fs from "node:fs";
import path from "node:path";

import type { CanonUniverse } from "@/types/canon";
import type { KairospediaCatalog } from "@/types/catalog";
import type {
  KairoswitterAccount,
  KairoswitterAuthorType,
  KairoswitterCatalog,
  KairoswitterLink,
  KairoswitterPost,
  RawKairoswitterPost,
} from "@/types/kairoswitter";
import { getCollection } from "@/lib/canon/loader";
import { repositoryRoot } from "@/lib/canon/paths";

export const postsDirectory = path.join(repositoryRoot, "data", "kairoswitter", "posts");
export const MAX_POST_LENGTH = 280;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const stableId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function readRawPosts(directory = postsDirectory): RawKairoswitterPost[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((file) => file.endsWith(".json")).sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(directory, file), "utf8")) as RawKairoswitterPost);
}

export const accountsFile = path.join(repositoryRoot, "data", "kairoswitter", "accounts.json");
const handlePattern = /^[a-z0-9_]{3,20}$/;

/** `key` is `<authorType>:<entityId>`; the handle is chosen by the author and does not have to be the person's name. */
export function readAccountHandles(file = accountsFile): Map<string, string> {
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { accounts: Array<{ key: string; handle: string }> };
  const handles = new Map<string, string>();
  const used = new Set<string>();
  for (const entry of raw.accounts) {
    if (!handlePattern.test(entry.handle)) throw new Error(`Kairoswitter account ${entry.key}: handle "${entry.handle}" must be 3-20 characters of a-z, 0-9 or _`);
    if (used.has(entry.handle)) throw new Error(`Duplicate Kairoswitter handle: ${entry.handle}`);
    if (handles.has(entry.key)) throw new Error(`Kairoswitter account listed twice: ${entry.key}`);
    used.add(entry.handle);
    handles.set(entry.key, entry.handle);
  }
  return handles;
}

interface Author { key: string; handle: string; displayName: string; href: string; organizationId: string | null; avatarSrc?: string }

const publicFile = (src: string) => fs.existsSync(path.join(repositoryRoot, "website", "public", src));
const firstExisting = (...sources: string[]) => sources.find(publicFile);

function authorLookup(catalog: KairospediaCatalog, handles: Map<string, string>): Map<string, Author> {
  const authors = new Map<string, Author>();
  const add = (key: string, author: Omit<Author, "key" | "handle">) => {
    const handle = handles.get(key);
    if (!handle) throw new Error(`Kairoswitter: ${key} has no handle in data/kairoswitter/accounts.json`);
    authors.set(key, { key, handle, ...author });
  };
  for (const org of catalog.organizations) add(`organization:${org.id}`, { displayName: org.name, href: `/wiki/organizations/${org.slug}`, organizationId: org.id });
  for (const team of catalog.teams) add(`team:${team.id}`, { displayName: team.name, href: `/wiki/teams/${team.slug}`, organizationId: team.organizationId });
  for (const player of catalog.players) add(`player:${player.id}`, { displayName: player.realName, href: `/wiki/players/${player.slug}`, organizationId: null, avatarSrc: firstExisting(`/kairoswitter/avatars/${player.id}.png`, `/portraits/${player.id}.png`) });
  for (const member of catalog.staff) {
    const named = member.realName && member.realName !== "TBD" ? member.realName : member.nickname ?? member.displayName;
    add(`staff:${member.id}`, { displayName: named, href: `/wiki/staff/${member.slug}`, organizationId: null, avatarSrc: firstExisting(`/kairoswitter/avatars/${member.id}.png`, `/staff-portraits/${member.id}.png`) });
  }
  for (const key of handles.keys()) if (!authors.has(key)) throw new Error(`Kairoswitter: ${key} in accounts.json is not a published entity`);
  return authors;
}

/** Validates the posts and builds the catalog: accounts, visible posts (newest first) and the number of scheduled posts. */
export function buildKairoswitterCatalog(universe: CanonUniverse, catalog: KairospediaCatalog, raw: RawKairoswitterPost[] = readRawPosts()): KairoswitterCatalog {
  const narrativeDate = catalog.metadata.currentNarrativeDate;
  const episodes = new Map(getCollection<{ id: string; episodeNumber: number; exactStoryDate?: string | null }>(universe, "episodes").map((episode) => [episode.id, episode]));
  const sources = new Set(getCollection<{ id: string }>(universe, "sources").map((source) => source.id));
  const authors = authorLookup(catalog, readAccountHandles());
  const teams = new Map(catalog.teams.map((team) => [team.id, team]));
  const players = new Map(catalog.players.map((player) => [player.id, player]));
  const staff = new Map(catalog.staff.map((member) => [member.id, member]));
  const competitions = new Map(catalog.competitions.map((competition) => [competition.id, competition]));

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const accounts = new Map<string, KairoswitterAccount>();
  const handles = new Map<string, string>();
  const posts: KairoswitterPost[] = [];
  let scheduledCount = 0;
  let mediaPending = 0;
  for (const author of authors.values()) {
    const [type, entityId] = author.key.split(':');
    if (handles.has(author.handle)) throw new Error(`Duplicate Kairoswitter handle: ${author.handle}`);
    handles.set(author.handle, author.key);
    accounts.set(author.key, { ...author, type: type as KairoswitterAuthorType, entityId: entityId!, postCount: 0 });
  }

  for (let post of raw) {
    const where = `Kairoswitter post ${post.id ?? "(no id)"}`;
    const fail = (message: string): never => { throw new Error(`${where}: ${message}`); };
    if (!post.id || !stableId.test(post.id)) fail("id must be a stable kebab-case id");
    if (!post.slug || !stableId.test(post.slug)) fail("slug must be a stable kebab-case id");
    if (ids.has(post.id)) fail("duplicate id");
    if (slugs.has(post.slug)) fail("duplicate slug");
    ids.add(post.id);
    slugs.add(post.slug);
    if (post.continuityId !== "kairos-universe") fail("continuityId must be kairos-universe");
    if (post.canonStatus !== "confirmed") fail("canonStatus must be confirmed");
    if (typeof post.text !== "string" || post.text.trim().length === 0) fail("text is empty");
    if ([...post.text].length > MAX_POST_LENGTH) fail(`text is longer than ${MAX_POST_LENGTH} characters`);
    if (!isoDateTime.test(post.postedAt)) fail("postedAt must look like 2027-01-28T17:40");
    if (!post.timeZone) fail("timeZone is required");
    if (post.media) {
      if (!/^\/kairoswitter\/media\/[a-z0-9-]+\.png$/.test(post.media.src) || !post.media.alt.trim()) fail('invalid media path or missing alt text');
      if (!publicFile(post.media.src)) { console.warn(`Kairoswitter post ${post.id}: image ${post.media.src} is not generated yet; the post is shown without it.`); mediaPending += 1; post = { ...post, media: undefined }; }
    }
    if (!isoDate.test(post.storyDate)) fail("storyDate must look like 2027-01-28");
    if (post.postedAt.slice(0, 10) !== post.storyDate) fail("postedAt must be on the storyDate");
    if (post.episodeIds.length + post.sourceIds.length === 0) fail("every post needs at least one episode or source");
    for (const id of post.sourceIds) if (!sources.has(id)) fail(`unknown source ${id}`);
    const episodeLabels: string[] = [];
    for (const id of post.episodeIds) {
      const episode = episodes.get(id);
      if (!episode) fail(`unknown episode ${id}`);
      const date = episode!.exactStoryDate;
      if (date && isoDate.test(date) && post.storyDate < date) fail(`storyDate ${post.storyDate} is before ${id} (${date})`);
      episodeLabels.push(`Episode ${episode!.episodeNumber}`);
    }
    const author = authors.get(`${post.authorType}:${post.authorId}`);
    if (!author) fail(`author ${post.authorType}:${post.authorId} is not a published entity`);
    const related: KairoswitterLink[] = [];
    for (const id of post.relatedTeamIds) { const team = teams.get(id); if (!team) fail(`unknown related team ${id}`); related.push({ label: team!.name, href: `/wiki/teams/${team!.slug}` }); }
    for (const id of post.relatedPlayerIds) { const player = players.get(id); if (!player) fail(`unknown related player ${id}`); related.push({ label: player!.nickname, href: `/wiki/players/${player!.slug}` }); }
    for (const id of post.relatedStaffIds) { const member = staff.get(id); if (!member) fail(`unknown related staff ${id}`); related.push({ label: member!.nickname ?? member!.displayName, href: `/wiki/staff/${member!.slug}` }); }
    for (const id of post.relatedCompetitionIds) { const competition = competitions.get(id); if (!competition) fail(`unknown related competition ${id}`); related.push({ label: competition!.name, href: `/wiki/competitions/${competition!.slug}` }); }

    if (post.storyDate > narrativeDate) { scheduledCount += 1; continue; }

    const existingHandle = handles.get(author!.handle);
    if (existingHandle && existingHandle !== author!.key) fail(`handle @${author!.handle} is used by two accounts`);
    handles.set(author!.handle, author!.key);
    const account = accounts.get(author!.key) ?? { key: author!.key, handle: author!.handle, displayName: author!.displayName, type: post.authorType as KairoswitterAuthorType, entityId: post.authorId, href: author!.href, organizationId: author!.organizationId, postCount: 0 };
    account.postCount += 1;
    accounts.set(author!.key, account);
    posts.push({ id: post.id, slug: post.slug, text: post.text, postedAt: post.postedAt, timeZone: post.timeZone, storyDate: post.storyDate, authorKey: author!.key, episodeLabels, related, pinned: post.pinned, media: post.media });
  }

  posts.sort((a, b) => b.postedAt.localeCompare(a.postedAt) || a.id.localeCompare(b.id));
  return { narrativeDate, accounts: [...accounts.values()].sort((a, b) => a.displayName.localeCompare(b.displayName)), posts, scheduledCount, mediaPending };
}

export function kairoswitterRoutes(feed: KairoswitterCatalog): string[] {
  return ["/wiki/kairoswitter", ...feed.accounts.map((account) => `/wiki/kairoswitter/accounts/${account.handle}`), ...feed.posts.map((post) => `/wiki/kairoswitter/posts/${post.slug}`)];
}
