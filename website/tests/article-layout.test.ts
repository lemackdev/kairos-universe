import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ExternalOrganizationArticle } from "@/components/articles/ExternalArticles";
import { GameArticle } from "@/components/articles/GameArticle";
import { OrganizationArticle } from "@/components/articles/OrganizationArticle";
import { StaffArticle } from "@/components/articles/StaffArticle";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { buildCatalog } from "@/lib/catalog/build";
import { loadExternalScene } from "@/lib/external/scene";

const catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());

describe("shared encyclopedia article layout", () => {
  it("gives Adrian the same article structure as players", () => {
    const adrian = catalog.staff.find((person) => person.id === "adrian-elias-vale")!;
    const html = renderToStaticMarkup(createElement(StaffArticle, { person: adrian }));
    expect(html).toContain("wikiArticle");
    expect(html).toContain('id="overview"');
    expect(html).toContain('id="role"');
    expect(html).toContain('id="episode-history"');
    expect(html).toContain("/wiki/organizations/kairos-esports");
    expect(html).toContain("adrian-elias-vale.png");
  });

  it("does not surface a separate real-world background section on staff pages", () => {
    const stewie = catalog.staff.find((person) => person.id === "jake-stewie2k-yip")!;
    const html = renderToStaticMarkup(createElement(StaffArticle, { person: stewie }));
    expect(html).not.toContain('id="real-world-background"');
    expect(html).not.toContain("Real-world figure in fictional Kairos role");
  });

  it("uses the article shell for canon and external organizations", () => {
    const kairos = catalog.organizations.find((organization) => organization.id === "kairos-esports")!;
    const html = renderToStaticMarkup(createElement(OrganizationArticle, {
      organization: kairos,
      teams: catalog.teams.filter((team) => kairos.teamIds.includes(team.id)),
    }));
    expect(html).toContain("wikiArticle");
    expect(html).toContain('id="teams"');

    const scene = loadExternalScene();
    const external = renderToStaticMarkup(createElement(ExternalOrganizationArticle, {
      organization: scene.organizations[0]!, scene,
    }));
    expect(external).toContain("wikiArticle");
    expect(external).toContain("Real-world reference");
  });

  it("uses the article shell for each published game", () => {
    for (const game of catalog.games) {
      const html = renderToStaticMarkup(createElement(GameArticle, {
        game,
        teams: catalog.teams.filter((team) => game.activeTeamIds.includes(team.id)),
        players: catalog.players.filter((player) => game.activePlayerIds.includes(player.id)),
        nextMilestone: catalog.metadata.nextCompetitiveMilestone,
      }));
      expect(html).toContain("wikiArticle");
      expect(html).toContain('id="teams"');
      expect(html).toContain('id="players"');
    }
  });
});
