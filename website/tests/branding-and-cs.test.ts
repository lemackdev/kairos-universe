import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { filterBranding, loadBranding, readPublishedPortraits, safeAssetPath } from "../../shared/branding";
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
  it("publishes no academy assets or references", () => {
    const filtered = filterBranding(loadBranding(root), loadPublicationManifest().enabledTeams);
    expect(filtered.uniforms).toHaveLength(1);
    expect(filtered.assets).toHaveLength(4);
    expect(JSON.stringify(filtered)).not.toContain("kairos-lol-academy-blue");
    expect(JSON.stringify(filtered)).not.toContain("kairos-cs-academy");
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
  it("maps ten distinct portrait files to current narrative ages", () => {
    const portraits = readPublishedPortraits();
    expect(portraits).toHaveLength(10);
    expect(new Set(portraits.map(p => p.sha256)).size).toBe(10);
    expect(portraits.every(p => p.width === 1024 && p.height === 1536)).toBe(true);
  });
});
