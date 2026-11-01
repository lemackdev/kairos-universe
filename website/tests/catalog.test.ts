import { beforeAll, describe, expect, it } from "vitest";

import type { KairospediaCatalog } from "@/types/catalog";
import { buildCatalog } from "@/lib/catalog/build";
import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";

let catalog: KairospediaCatalog;

beforeAll(() => {
  catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
});

describe("initial Kairospedia publication", () => {
  it("publishes the enabled teams and players with five-player rosters", () => {
    const manifest = loadPublicationManifest();
    expect(catalog.organizations.map((record) => record.id)).toEqual([
      "kairos-esports",
    ]);
    expect(catalog.teams.map((record) => record.id)).toEqual(manifest.enabledTeams);
    expect(catalog.players).toHaveLength(manifest.enabledPlayers.length);
    expect(catalog.teams.every(team => team.roster.length === 5)).toBe(true);
    expect(catalog.players.every(player => player.status.includes("active") || player.status === "signed")).toBe(true);
  });

  it("preserves role and captain invariants", () => {
    const team = catalog.teams[0];
    const moss = catalog.players.find((player) => player.id === "daniel-moss-reyes");
    const fourOhFour = catalog.players.find(
      (player) => player.id === "mason-404-brooks",
    );
    expect(team?.captainPlayerId).toBe("daniel-moss-reyes");
    expect(moss?.isCaptain).toBe(true);
    expect(fourOhFour?.role).toBe("Mid");
    expect(fourOhFour?.isCaptain).toBe(false);
  });

  it("publishes no matches, statistics, external organizations, or hidden teams", () => {
    expect(catalog.matches).toEqual([]);
    expect(catalog.teams[0]?.statistics).toEqual({});
    const serialized = JSON.stringify(catalog);
    expect(serialized).not.toContain("kairos-lol-academy-blue");
    expect(serialized).not.toContain("kairos-lol-academy-white");
    expect(serialized).not.toContain("kairos-counter-strike-main");
    expect(catalog.matches).toHaveLength(0);
  });

  it("generates only routes for enabled entities", () => {
    expect(catalog.routes).toContain("/wiki/teams/kairos-lol-main");
    expect(catalog.routes).toContain("/wiki/players/mason-404-brooks");
    expect(
      catalog.routes.some((route) => route.includes("counter-strike")),
    ).toBe(true);
    expect(catalog.routes).toContain("/wiki/teams/kairos-cs-academy");
    expect(
      catalog.routes.some((route) => route.includes("lol-academy")),
    ).toBe(false);
  });

  it("renders readable source labels without filesystem paths", () => {
    const sources = catalog.players.flatMap((player) => player.sources);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((source) => !source.label.includes("data/"))).toBe(true);
  });
});
