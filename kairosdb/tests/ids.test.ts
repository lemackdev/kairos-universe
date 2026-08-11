import { describe, expect, it } from "vitest";

import {
  buildStableId,
  createSlugRegistry,
  reserveSlug,
  slugify,
} from "../scripts/leaguepedia/ids";

describe("slugify", () => {
  it("lowercases and dashes separators", () => {
    expect(slugify("Team Liquid")).toBe("team-liquid");
  });

  it("strips accents", () => {
    expect(slugify("Caédrel")).toBe("caedrel");
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Hanwha Life -- Esports!! ")).toBe("hanwha-life-esports");
  });

  it("handles numeric nicknames", () => {
    expect(slugify("Baus2004")).toBe("baus2004");
  });
});

describe("buildStableId", () => {
  it("namespaces every kind and never produces a bare ID", () => {
    expect(buildStableId("player", "Faker")).toBe("external-lol-player-faker");
    expect(buildStableId("team", "T1")).toBe("external-lol-team-t1");
    expect(buildStableId("organization", "T1")).toBe("external-lol-org-t1");
    expect(buildStableId("staff", "kkOma")).toBe("external-lol-staff-kkoma");
  });

  it("gives disambiguated source pages distinct stable IDs", () => {
    const a = buildStableId("player", "Rush");
    const b = buildStableId("player", "Rush (player)");
    expect(a).not.toBe(b);
  });
});

describe("reserveSlug", () => {
  it("keeps the desired slug when unclaimed", () => {
    const registry = createSlugRegistry();
    const slug = reserveSlug(registry, "player", "faker", "external-lol-player-faker", "Faker");
    expect(slug).toBe("faker");
  });

  it("disambiguates a collision instead of merging identities", () => {
    const registry = createSlugRegistry();
    const first = reserveSlug(registry, "player", "rush", "external-lol-player-rush", "Rush");
    const second = reserveSlug(
      registry,
      "player",
      "rush",
      "external-lol-player-rush-player-2",
      "Rush (player 2)",
    );
    expect(first).toBe("rush");
    expect(second).not.toBe("rush");
    expect(second).toContain("rush");
  });

  it("is idempotent for the same entity id", () => {
    const registry = createSlugRegistry();
    const first = reserveSlug(registry, "team", "t1", "external-lol-team-t1", "T1");
    const second = reserveSlug(registry, "team", "t1", "external-lol-team-t1", "T1");
    expect(first).toBe(second);
  });
});
