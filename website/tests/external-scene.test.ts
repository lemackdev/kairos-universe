import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { loadExternalScene, filterScene, leagueCounts, sceneRoutes, validateScene } from "@/lib/external/scene";
import { buildExternalSearch } from "@/lib/external/search";
import { searchRecords } from "@/lib/search/search";
import { ExternalPlayerArticle, ExternalTeamArticle } from "@/components/articles/ExternalArticles";
import { generatedRoot } from "@/lib/canon/paths";
import type { KairospediaCatalog } from "@/types/catalog";
import { loadPublicationManifest } from "@/lib/canon/loader";

const scene = loadExternalScene();
describe("pre-Worlds 2026 external references", () => {
  it("validates schemas, individual records, indexes and all seven leagues", () => {
    expect(scene.teams).toHaveLength(68);
    expect(scene.players).toHaveLength(376);
    expect(scene.rosterTenures).toHaveLength(379);
    for (const [league, count] of Object.entries(leagueCounts)) expect(scene.teams.filter((t) => t.league === league)).toHaveLength(count);
    expect(scene.teams.filter((t) => t.tier === 2).every((t) => t.league === "NACL")).toBe(true);
    expect(() => validateScene(scene)).not.toThrow();
  });
  it("retains one player identity for reviewed cross-event moves without inventing transfers", () => {
    for (const nickname of ["Photic", "Moham", "Hena"]) {
      const people = scene.players.filter((p) => p.nickname === nickname);
      expect(people).toHaveLength(1);
      expect(people[0]?.rosterTenureIds).toHaveLength(2);
    }
    expect(scene.rosterTenures.every((t) => t.joinedDate === null && t.leftDate === null && t.isCurrent === null && t.isCaptain === null)).toBe(true);
  });
  it("retains last available rosters for teams not in the final LPL split", () => {
    expect(scene.teams.filter((t) => t.basis === "last-available-domestic-tournament").map((t) => t.name).sort()).toEqual(["Oh My God", "Ultra Prime"]);
    expect(scene.sources.every((s) => s.eventEndDate < "2026-10-15")).toBe(true);
    expect(scene.teams.filter((t) => t.sourceIds.includes("source-pre-worlds-2026-lpl-regional-finals"))).toHaveLength(4);
  });
  it("rejects duplicate people, broken references, unsupported biography and other lower tiers", () => {
    const duplicate = structuredClone(scene); duplicate.players.push(duplicate.players[0]!);
    expect(() => validateScene(duplicate)).toThrow(/Duplicate ID/);
    const broken = structuredClone(scene); broken.rosterTenures[0]!.playerId = "missing-player";
    expect(() => validateScene(broken)).toThrow();
    const wrongTier = structuredClone(scene); wrongTier.teams[0]!.tier = 3;
    expect(() => validateScene(wrongTier)).toThrow(/Out-of-scope/);
    const invented = structuredClone(scene); Object.assign(invented.players[0]!, { nationality: "guessed" });
    expect(() => validateScene(invented)).toThrow(/Unsupported biography/);
  });
  it("finds every player by nickname and makes only enabled references searchable", () => {
    const search = buildExternalSearch(scene);
    for (const player of scene.players) expect(searchRecords(search, player.nickname).some((hit) => hit.id === player.id)).toBe(true);
    const filtered = filterScene(scene, ["LCS", "NACL"]);
    expect(filtered.teams).toHaveLength(18);
    expect(filtered.players.every((p) => p.rosterTenureIds.every((id) => filtered.rosterTenures.some((t) => t.id === id)))).toBe(true);
    expect(buildExternalSearch(filtered).some((r) => r.name === "Faker")).toBe(false);
    expect(sceneRoutes(filtered)).not.toContain("/wiki/teams/external-t1");
    expect(() => filterScene(scene, ["LCK CL"])).toThrow(/allowlist/);
  });
  it("generates unique, collision-free routes alongside untouched Kairos content", () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(generatedRoot, "catalog.json"), "utf8")) as KairospediaCatalog;
    expect(catalog.routes).toContain("/wiki/world");
    expect(new Set(catalog.routes).size).toBe(catalog.routes.length);
    expect(catalog.externalScene?.teams).toHaveLength(68);
    expect(catalog.teams.map((t) => t.id)).toEqual(loadPublicationManifest().enabledTeams);
    expect(catalog.players.map((player) => player.id)).toEqual(loadPublicationManifest().enabledPlayers);
    expect(catalog.players.find((p) => p.nickname === "404")?.role).toBe("Mid");
    expect(catalog.teams[0]?.captainPlayerId).toBe("daniel-moss-reyes");
    for (const hidden of ["kairos-counter-strike-main", "kairos-lol-academy-blue", "kairos-lol-academy-white"]) expect(JSON.stringify(catalog)).not.toContain(hidden);
  });
  it("renders source-backed pages without claiming real players have no official career", () => {
    const team = scene.teams.find((t) => t.name === "T1")!;
    const player = scene.players.find((p) => p.nickname === "Faker")!;
    const teamHtml = renderToStaticMarkup(createElement(ExternalTeamArticle, { team, scene }));
    const playerHtml = renderToStaticMarkup(createElement(ExternalPlayerArticle, { player, scene }));
    for (const html of [teamHtml, playerHtml]) {
      expect(html).toContain("Real-world reference, review pending.");
      expect(html).toContain("https://liquipedia.net/leagueoflegends/LCK/2026");
      expect(html).not.toContain("No official matches recorded.");
    }
    expect(playerHtml).toContain("Results and statistics have not been imported.");
    expect(teamHtml).toContain('id="player-roster"');
  });
});
