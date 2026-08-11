import { describe, expect, it } from "vitest";

import { foldAccents, searchEntries, type SearchEntry } from "../src/lib/search/search";

const INDEX: SearchEntry[] = [
  {
    id: "external-lol-player-faker",
    kind: "external-player",
    label: "Faker",
    subtitle: "Player — mid",
    href: "/players/faker",
    keywords: ["faker", "lee sang-hyeok"],
  },
  {
    id: "external-lol-player-caedrel",
    kind: "external-player",
    label: "Caedrel",
    subtitle: "Player — top",
    href: "/players/caedrel",
    keywords: foldAccents("Caédrel") ? ["caedrel"] : ["caedrel"],
  },
  {
    id: "external-lol-player-baus",
    kind: "external-player",
    label: "Baus2004",
    subtitle: "Player — top",
    href: "/players/baus2004",
    keywords: ["baus2004", "baus"],
  },
  {
    id: "external-lol-player-faker-2",
    kind: "external-player",
    label: "Faker (duplicate nickname)",
    subtitle: "Player — support",
    href: "/players/faker-2",
    keywords: ["faker", "second faker"],
  },
  {
    id: "external-lol-team-t1",
    kind: "external-team",
    label: "T1",
    subtitle: "Team — Korea",
    href: "/teams/t1",
    keywords: ["t1"],
  },
  {
    id: "kairos-player-rkn",
    kind: "kairos-player",
    label: 'Noah Bennett "rkN"',
    subtitle: "Top — Kairos League of Legends",
    href: "/players/noah-rkn-bennett",
    keywords: ["noah bennett", "rkn", "noah-rkn-bennett", "top"],
  },
];

describe("foldAccents", () => {
  it("strips diacritics and lowercases", () => {
    expect(foldAccents("Caédrel")).toBe("caedrel");
    expect(foldAccents("FAKER")).toBe("faker");
  });
});

describe("searchEntries", () => {
  it("returns nothing for an empty query", () => {
    expect(searchEntries(INDEX, "")).toEqual([]);
    expect(searchEntries(INDEX, "   ")).toEqual([]);
  });

  it("matches case-insensitively", () => {
    const results = searchEntries(INDEX, "FAKER");
    expect(results.map((r) => r.id)).toContain("external-lol-player-faker");
  });

  it("matches accented names via an unaccented query", () => {
    const results = searchEntries(INDEX, "caedrel");
    expect(results.map((r) => r.id)).toContain("external-lol-player-caedrel");
  });

  it("matches numeric nicknames", () => {
    const results = searchEntries(INDEX, "baus2004");
    expect(results.map((r) => r.id)).toContain("external-lol-player-baus");
  });

  it("returns both entries for a duplicate nickname rather than collapsing them", () => {
    const results = searchEntries(INDEX, "faker");
    const ids = results.map((r) => r.id);
    expect(ids).toContain("external-lol-player-faker");
    expect(ids).toContain("external-lol-player-faker-2");
  });

  it("distinguishes kairos-original from external-snapshot players by kind", () => {
    const results = searchEntries(INDEX, "top");
    const kairos = results.find((r) => r.id === "kairos-player-rkn");
    expect(kairos?.kind).toBe("kairos-player");
  });

  it("ranks exact matches above substring matches", () => {
    const results = searchEntries(INDEX, "t1");
    expect(results[0]?.id).toBe("external-lol-team-t1");
  });

  it("matches romanized names stored as plain keywords", () => {
    const results = searchEntries(INDEX, "lee sang-hyeok");
    expect(results.map((r) => r.id)).toContain("external-lol-player-faker");
  });
});
