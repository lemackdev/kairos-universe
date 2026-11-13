import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import type { KairospediaCatalog } from "@/types/catalog";
import type { RawKairoswitterPost } from "@/types/kairoswitter";
import { loadCanonUniverse } from "@/lib/canon/loader";
import { buildKairoswitterCatalog, MAX_POST_LENGTH, readRawPosts } from "@/lib/kairoswitter/build";

const root = path.resolve(__dirname, "../..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "website/.generated/catalog.json"), "utf8")) as KairospediaCatalog;
const universe = loadCanonUniverse();

const base: RawKairoswitterPost = {
  id: "post-test-001", slug: "post-test-001", continuityId: "kairos-universe", authorType: "organization", authorId: "kairos-esports",
  text: "Test post.", postedAt: "2027-01-28T18:00", timeZone: "PT", storyDate: "2027-01-28", episodeIds: ["episode-117"],
  sourceIds: ["source-episodes-115-118"], relatedTeamIds: [], relatedPlayerIds: [], relatedStaffIds: [], relatedCompetitionIds: [],
  pinned: false, canonStatus: "confirmed", notes: [],
};
const build = (...posts: Array<Partial<RawKairoswitterPost>>) => buildKairoswitterCatalog(universe, catalog, posts.map((post, index) => ({ ...base, id: `post-test-00${index + 1}`, slug: `post-test-00${index + 1}`, ...post })));

describe("Kairoswitter", () => {
  it("gives every player a unique account with a portrait that exists", () => {
    const accounts = build().accounts;
    expect(new Set(accounts.map(account => account.handle)).size).toBe(accounts.length);
    for (const player of catalog.players) {
      const account = accounts.find(entry => entry.key === `player:${player.id}`)!;
      expect(account.displayName).toBe(player.realName);
      expect(fs.existsSync(path.join(root, "website/public", account.avatarSrc!))).toBe(true);
    }
  });

  it("keeps the images the posts ask for accessible and shows only the ones that exist", () => {
    const requested = readRawPosts().filter(post => post.media);
    expect(requested).toHaveLength(17);
    for (const post of requested) expect(post.media!.alt.trim().length).toBeGreaterThan(0);
    const shown = catalog.kairoswitter!.posts.filter(post => post.media);
    for (const post of shown) expect(fs.existsSync(path.join(root, "website/public", post.media!.src))).toBe(true);
    expect(shown.length + catalog.kairoswitter!.mediaPending).toBe(requested.length);
  });

  it("gives every published player, staff member, team and the organization one chosen handle that is not just their name", () => {
    const accounts = catalog.kairoswitter!.accounts;
    const expected = catalog.players.length + catalog.staff.length + catalog.teams.length + catalog.organizations.length;
    expect(accounts).toHaveLength(expected);
    for (const account of accounts) expect(account.handle).toMatch(/^[a-z0-9_]{3,20}$/);
    const normalized = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
    for (const account of accounts.filter(entry => entry.type === "player")) {
      expect(account.handle).not.toBe(normalized(account.displayName));
      const player = catalog.players.find(entry => entry.id === account.entityId)!;
      expect(account.handle).not.toBe(normalized(player.nickname));
    }
  });

  it("rejects media outside the post image directory and missing image files", () => {
    expect(() => build({ media: { src: "/kairoswitter/media/../secret.png", alt: "Photo" } })).toThrow(/invalid media/);
    expect(build({ media: { src: "/kairoswitter/media/missing-test.png", alt: "Photo" } }).posts[0]!.media).toBeUndefined();
    expect(build({ media: { src: "/kairoswitter/media/missing-test.png", alt: "Photo" } }).mediaPending).toBe(1);
  });

  it("publishes the posts in the repository, newest first, with an account for each author", () => {
    const feed = catalog.kairoswitter!;
    expect(readRawPosts().length).toBeGreaterThanOrEqual(56);
    expect(feed.posts.length + feed.scheduledCount).toBe(readRawPosts().length);
    expect(feed.posts.map((post) => post.postedAt)).toEqual([...feed.posts.map((post) => post.postedAt)].sort().reverse());
    for (const post of feed.posts) expect(feed.accounts.some((account) => account.key === post.authorKey)).toBe(true);
    expect(feed.accounts.map((account) => account.handle)).toContain("kairos_hq");
    expect(catalog.routes).toContain("/wiki/kairoswitter");
  });

  it("limits a post to 280 characters", () => {
    expect(() => build({ text: "x".repeat(MAX_POST_LENGTH + 1) })).toThrow(/longer than 280/);
    expect(build({ text: "x".repeat(MAX_POST_LENGTH) }).posts).toHaveLength(1);
  });

  it("requires a published author and at least one episode or source", () => {
    expect(() => build({ authorId: "nobody" })).toThrow(/not a published entity/);
    expect(() => build({ episodeIds: [], sourceIds: [] })).toThrow(/episode or source/);
    expect(() => build({ episodeIds: ["episode-9999"] })).toThrow(/unknown episode/);
    expect(() => build({ sourceIds: ["source-missing"] })).toThrow(/unknown source/);
  });

  it("refuses a post dated before the episode it reports", () => {
    expect(() => build({ storyDate: "2027-01-27", postedAt: "2027-01-27T09:00" })).toThrow(/before episode-117/);
  });

  it("keeps posts after the narrative date out of the feed", () => {
    const feed = build({ storyDate: "2027-12-31", postedAt: "2027-12-31T09:00" }, {});
    expect(feed.posts).toHaveLength(1);
    expect(feed.scheduledCount).toBe(1);
  });

  it("rejects duplicate ids, a mismatched post time and a missing time zone", () => {
    expect(() => buildKairoswitterCatalog(universe, catalog, [base, base])).toThrow(/duplicate id/);
    expect(() => build({ postedAt: "2027-01-29T09:00" })).toThrow(/on the storyDate/);
    expect(() => build({ timeZone: "" })).toThrow(/timeZone/);
  });
});
