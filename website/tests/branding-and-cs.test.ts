import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { filterBranding, loadBranding, readPublishedPortraits, readPublishedTeamLineups, safeAssetPath } from "../../shared/branding";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { buildCatalog } from "@/lib/catalog/build";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { PlayerArticle } from "@/components/articles/PlayerArticle";

const root = path.resolve("..");
describe("branding and Counter-Strike publication", () => {
  it("validates ten original and reconstructed assets and all assignments", () => {
    const branding = loadBranding(root);
    expect(branding.assets).toHaveLength(10);
    expect(branding.uniforms).toHaveLength(4);
    const assignments = Object.fromEntries(branding.uniforms.flatMap(u => u.teamIds.map(id => [id, u.primaryColor])));
    expect(assignments).toEqual({ "kairos-lol-main": "black", "kairos-cs-main": "black", "kairos-lol-academy-blue": "blue", "kairos-lol-academy-white": "white", "kairos-cs-academy": "green" });
    expect(branding.uniforms.every(u => u.technicalSupplier.status === "pending-formal-narrative-canonization" && u.technicalSupplier.contractValue === null)).toBe(true);
    expect(() => safeAssetPath(root, "assets/../../outside.png")).toThrow();
  });
  it("publishes branding for every enabled team", () => {
    const manifest = loadPublicationManifest();
    const filtered = filterBranding(loadBranding(root), manifest.enabledTeams);
    expect(filtered.uniforms).toHaveLength(4);
    expect(filtered.assets).toHaveLength(10);
    for (const teamId of manifest.enabledTeams) {
      expect(JSON.stringify(filtered)).toContain(teamId);
    }
  });
  it("publishes five signed CS players, exactly one captain, and no official results", () => {
    const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
    const team = catalog.teams.find(t => t.id === "kairos-cs-main")!;
    const players = catalog.players.filter(p => p.currentTeamId === team.id);
    expect(players).toHaveLength(5);
    expect(team.roster).toHaveLength(5);
    expect(players.filter(p => p.isCaptain).map(p => p.id)).toEqual(["caleb-atlas-mercer"]);
    expect(players.every(p => p.status === "signed" && p.officialMatchCount === 0 && Object.keys(p.statistics).length === 0)).toBe(true);
    expect(players.find(p => p.nickname === "FLACOGOMEZ")?.age).toBe(17);
    expect(team.roster.find(p => p.nickname === "MoteConHuesillo")?.nationalities).toEqual(["Mexican", "Chilean"]);
    expect(team.staff.map(s => s.staffId)).toContain("lukas-luk-novak");
    const html = renderToStaticMarkup(createElement(TeamArticle, { team, organization: catalog.organizations[0] }));
    expect(html).toContain("No official matches recorded.");
    expect(html).toContain("2027 Uniform");
    for (const player of players) {
      expect(catalog.routes).toContain(`/wiki/players/${player.slug}`);
      const page = renderToStaticMarkup(createElement(PlayerArticle, { player, team, narrativeDate: catalog.metadata.currentNarrativeDate }));
      expect(page).toContain("AI-generated illustrative portrait");
      expect(page).toContain(player.id + ".png");
    }
  });
  it("maps twenty-five distinct portraits across the published Kairos rosters", () => {
    const portraits = readPublishedPortraits();
    expect(portraits).toHaveLength(25);
    expect(new Set(portraits.map(p => p.sha256)).size).toBe(25);
    for (const teamId of ["kairos-lol-academy-blue", "kairos-lol-academy-white", "kairos-cs-academy"]) {
      const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
      const players = catalog.players.filter(p => p.currentTeamId === teamId);
      expect(players).toHaveLength(5);
      expect(portraits.filter(p => players.some(player => player.id === p.playerId))).toHaveLength(5);
    }
    expect(portraits.every(p => p.width >= 1000 && p.height >= 1000)).toBe(true);
  });
  it("renders all academy portraits on their player articles", () => {
    const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
    for (const [teamId, jersey] of [["kairos-lol-academy-blue", "Kairos Academy Blue jersey"], ["kairos-lol-academy-white", "Kairos Academy White jersey"], ["kairos-cs-academy", "Kairos CS Academy green jersey"]]) {
      const team = catalog.teams.find(t => t.id === teamId)!;
      const players = catalog.players.filter(p => p.currentTeamId === team.id);
      expect(players).toHaveLength(5);
      for (const player of players) {
        const page = renderToStaticMarkup(createElement(PlayerArticle, { player, team, narrativeDate: catalog.metadata.currentNarrativeDate }));
        expect(page).toContain(`${player.id}.png`);
        expect(page).toContain(jersey);
      }
    }
  });
  it("publishes one canon-ordered lineup image on every Kairos team article", () => {
    const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
    const lineups = readPublishedTeamLineups();
    expect(lineups).toHaveLength(5);
    expect(new Set(lineups.map(lineup => lineup.sha256)).size).toBe(5);
    for (const team of catalog.teams) {
      const lineup = lineups.find(item => item.teamId === team.id);
      expect(lineup).toBeDefined();
      expect(lineup?.playerIds).toHaveLength(5);
      expect(lineup?.playerIds.every(id => team.roster.some(player => player.playerId === id))).toBe(true);
      const html = renderToStaticMarkup(createElement(TeamArticle, { team, organization: catalog.organizations[0] }));
      expect(html).toContain(`/team-lineups/${team.id}.png`);
      for (const id of lineup!.playerIds) {
        const player = team.roster.find(item => item.playerId === id)!;
        expect(html).toContain(`href="/wiki/players/${player.slug}"`);
      }
    }
  });
});
