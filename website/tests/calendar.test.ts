import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import type { KairospediaCatalog } from "@/types/catalog";
import { buildCatalog } from "@/lib/catalog/build";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { CalendarView } from "@/components/CalendarView";

let catalog: KairospediaCatalog;
let year2027: KairospediaCatalog["competitions"];

beforeAll(() => {
  catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
  year2027 = catalog.competitions.filter((competition) => (competition.startDate ?? "").startsWith("2027")
    || (!competition.startDate && competition.id.endsWith("-2027")));
});

describe("2027 competitive calendar", () => {
  it("renders the calendar view with both games represented", () => {
    const html = renderToStaticMarkup(createElement(CalendarView, { competitions: year2027 }));
    expect(html).toContain("League of Legends");
    expect(html).toContain("Counter-Strike");
  });

  it("has events in February but none in January", () => {
    const byMonth = (month: string) => year2027.filter((c) => (c.startDate ?? "").slice(5, 7) === month);
    expect(byMonth("01")).toHaveLength(0);
    expect(byMonth("02").length).toBeGreaterThan(0);
  });

  it("schedules no competitions in July (global competitive break)", () => {
    expect(year2027.filter((c) => (c.startDate ?? "").slice(5, 7) === "07")).toHaveLength(0);
  });

  it("displays the competitive break in the July column", () => {
    const html = renderToStaticMarkup(createElement(CalendarView, { competitions: year2027 }));
    expect(html).toContain("COMPETITIVE BREAK");
  });

  it("IEM Dallas 2027 starts 2027-02-03", () => {
    const event = catalog.competitions.find((c) => c.slug === "iem-dallas-2027");
    expect(event?.startDate).toBe("2027-02-03");
  });

  it("IEM Cologne 2027 ends 2027-06-27", () => {
    const event = catalog.competitions.find((c) => c.slug === "iem-cologne-2027");
    expect(event?.endDate).toBe("2027-06-27");
  });

  it("marks PGL Copenhagen Major and StarLadder Berlin Major as Major", () => {
    expect(catalog.competitions.find((c) => c.slug === "pgl-copenhagen-major-2027")?.tier).toBe("major");
    expect(catalog.competitions.find((c) => c.slug === "starladder-berlin-major-2027")?.tier).toBe("major");
  });

  it("every Counter-Strike 2027 competition references the fixed seven-map pool and no banned map", () => {
    const banned = ["Mirage", "Ancient", "Anubis", "Vertigo"];
    const csEvents = year2027.filter((c) => c.gameName === "Counter-Strike");
    expect(csEvents.length).toBe(34);
    for (const event of csEvents) {
      expect(event.mapPool).toEqual(["Cobblestone", "Inferno", "Nuke", "Overpass", "Dust II", "Train", "Cache"]);
      for (const map of banned) expect(event.mapPool).not.toContain(map);
    }
  });

  it("Crossroads Cup retains its 16-team regional allocation format", () => {
    const event = catalog.competitions.find((c) => c.slug === "crossroads-cup-2027");
    expect(event?.teamsCount).toBe(16);
    expect(event?.format.some((line) => line.includes("LCK 3"))).toBe(true);
  });

  it("World Championship remains the highest-prestige League event and WSCI the premier Tier 2 world event", () => {
    expect(catalog.competitions.find((c) => c.slug === "world-championship-2027")?.tier).toBe("world-championship");
    expect(catalog.competitions.find((c) => c.slug === "wsci-2027")?.tier).toBe("tier-2-world-championship");
  });

  it("Demacia Cup Global is not treated as equivalent to Worlds", () => {
    const demacia = catalog.competitions.find((c) => c.slug === "demacia-cup-global-2027");
    expect(demacia?.tier).not.toBe("world-championship");
    expect(demacia?.tier).toBe("postseason-international");
  });

  it("does not automatically register Kairos in any 2027 event except its directed LCS 2027 regional entry", () => {
    const withoutLcs = year2027.filter((competition) => competition.slug !== "lcs-2027");
    expect(withoutLcs.every((competition) => competition.participants.length === 0)).toBe(true);
    expect(withoutLcs.every((competition) => !competition.kairosParticipating)).toBe(true);
    const lcs = year2027.find((competition) => competition.slug === "lcs-2027");
    expect(lcs?.participants).toEqual([{ id: "kairos-lol-main", name: "Kairos Gaming", slug: "kairos-lol-main" }]);
    expect(lcs?.kairosParticipating).toBe(true);
  });

  it("Kairos gets no automatic international qualification from its LCS 2027 regional membership", () => {
    const internationalSlugs = ["first-stand-2027", "crossroads-cup-2027", "rift-masters-2027", "world-championship-2027", "demacia-cup-global-2027"];
    for (const slug of internationalSlugs) {
      const event = catalog.competitions.find((c) => c.slug === slug);
      expect(event?.kairosParticipating ?? false).toBe(false);
    }
  });

  it("renders event pages cleanly with empty participant and results data", () => {
    const event = catalog.competitions.find((c) => c.slug === "iem-dallas-2027")!;
    expect(event.participants).toEqual([]);
    expect(event.results).toEqual([]);
  });
});
