import { describe, expect, it } from "vitest";
import { buildCatalog } from "@/lib/catalog/build";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";

const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
const slugs = {
  "americas-lan": ["americas-lan-1-2027", "americas-lan-2-2027", "americas-lan-3-2027", "americas-lan-4-2027", "americas-lan-5-2027"],
  zotac: ["zotac-cup-masters-cordoba-2027", "zotac-cup-masters-curitiba-2027", "zotac-cup-masters-calgary-2027", "zotac-cup-masters-columbus-2027"],
  epicenter: ["epicenter-2027-1", "epicenter-2027-2"],
  dreamhack: ["dreamhack-open-1-2027", "dreamhack-open-2-2027", "dreamhack-open-3-2027", "dreamhack-open-4-2027"],
};
const all = Object.values(slugs).flat();
const find = (slug: string) => catalog.competitions.find((c) => c.slug === slug)!;
const overlaps = (a: { startDate: string | null; endDate: string | null }, b: { startDate: string | null; endDate: string | null }) =>
  a.startDate! <= b.endDate! && b.startDate! <= a.endDate!;

describe("2027 Tier 2 and Tier 3 Counter-Strike events", () => {
  it("creates the fifteen events with the approved tiers and locations", () => {
    expect(all).toHaveLength(15);
    for (const slug of all) expect(find(slug)).toBeDefined();
    for (const slug of slugs.zotac) expect(find(slug).tier).toBe("tier-2");
    for (const slug of [...slugs["americas-lan"], ...slugs.epicenter, ...slugs.dreamhack]) expect(find(slug).tier).toBe("tier-3");
    expect(slugs.zotac.map((slug) => find(slug).location)).toEqual([
      "Córdoba, Córdoba Province, Argentina", "Curitiba, Paraná, Brazil", "Calgary, Alberta, Canada", "Columbus, Ohio, USA",
    ]);
    expect(slugs["americas-lan"].map((slug) => find(slug).location)).toEqual([
      "Kansas City, Missouri, USA", "Guadalajara, Jalisco, Mexico", "Albuquerque, New Mexico, USA", "Winnipeg, Manitoba, Canada", "Monterrey, Nuevo León, Mexico",
    ]);
  });

  it("marks ZOTAC and Americas LAN as LAN, EPICENTER and DreamHack Open as online", () => {
    for (const slug of [...slugs.zotac, ...slugs["americas-lan"]]) expect(find(slug).eventType).toBe("lan");
    for (const slug of [...slugs.epicenter, ...slugs.dreamhack]) expect(find(slug).eventType).toBe("online");
  });

  it("starts in March or later, never runs in July, and avoids every Major", () => {
    const fixed = catalog.competitions.filter((c) => c.gameName === "Counter-Strike" && c.tier === "major");
    for (const slug of all) {
      const event = find(slug);
      expect(event.startDate! >= "2027-03-01").toBe(true);
      expect(event.startDate!.slice(5, 7)).not.toBe("07");
      expect(event.endDate!.slice(5, 7)).not.toBe("07");
      for (const other of fixed) expect(overlaps(event, other), `${slug} overlaps ${other.slug}`).toBe(false);
    }
  });

  it("does not overlap any other event in the batch", () => {
    for (const a of all) for (const b of all) if (a < b) expect(overlaps(find(a), find(b)), `${a} overlaps ${b}`).toBe(false);
  });

  it("establishes no participants or results (the team count follows the tier: 16 for Tier 2, 8 for Tier 3)", () => {
    for (const slug of all) {
      const event = find(slug);
      expect(event.teamsCount).toBe(event.tier === "tier-3" ? 8 : 16);
      expect(event.participantTeamIds ?? []).toEqual([]);
      expect(event.status).toBe("planned");
      expect(event.prizePool).toMatch(/^USD [\d,]+$/);
    }
  });
});
