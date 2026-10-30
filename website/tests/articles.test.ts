import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { buildCatalog } from "@/lib/catalog/build";
import { buildCompetitionViews } from "@/lib/catalog/competitions";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { PlayerArticle } from "@/components/articles/PlayerArticle";
import { TournamentArticle } from "@/components/articles/TournamentArticle";
import type { CompetitionView, KairospediaCatalog } from "@/types/catalog";

let catalog: KairospediaCatalog;
beforeAll(() => { catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest()); });

function checkSections(html: string, ids: string[]) {
  for (const id of ids) {
    expect(html.match(new RegExp('id="' + id + '"', "g"))).toHaveLength(1);
    expect(html).toContain('href="#' + id + '"');
    expect(html).toContain('id="' + id + '-heading"');
  }
}

describe("encyclopedia article templates", () => {
  it("renders the requested team sections, five active players and no invented former players", () => {
    const team = catalog.teams[0]!;
    const html = renderToStaticMarkup(createElement(TeamArticle, { team, organization: catalog.organizations[0] }));
    checkSections(html, ["history", "team-information", "timeline", "player-roster", "former", "organization", "sources"]);
    expect(team.roster).toHaveLength(5);
    expect(team.formerRoster).toEqual([]);
    expect(html).toContain("No former players recorded.");
    expect(html).toContain("No official matches recorded.");
    expect(html).toContain("Active / Captain");
    expect(team.timeline.map((episode) => episode.number)).toEqual(team.timeline.map((episode) => episode.number).sort((a, b) => a - b));
  });

  it("renders player sections with narrative age and honest unknowns", () => {
    const player = catalog.players.find((entry) => entry.nickname === "404")!;
    const html = renderToStaticMarkup(createElement(PlayerArticle, { player, team: catalog.teams[0], narrativeDate: catalog.metadata.currentNarrativeDate }));
    checkSections(html, ["overview", "background-information", "team-history", "trivia", "individual-awards", "tournament-results"]);
    expect(html).toContain("18 (as of 2026-11-24)");
    expect(html).toContain("No confirmed individual awards recorded.");
    expect(html).toContain("No confirmed tournament results recorded.");
    expect(html).toContain("No official matches recorded.");
    expect(html).toContain("Cipher");
    expect(player.nationality).toBeNull();
    expect(player.teamHistory[0]?.teamName).toBe(catalog.teams[0]?.name);
    expect(player.teamHistory[0]?.role).toBe("Mid");
    expect(player.isCaptain).toBe(false);
  });

  it("uses the same player template for Counter-Strike without League role labels", () => {
    const player = { ...catalog.players[0]!, gameName: "Counter-Strike", gameId: "game-counter-strike",
      role: "IGL / Rifler", mentor: null, teamHistory: [], firstAppearance: null, episodeAppearances: [],
      currentTeamName: "Test team", historicalAliases: [], sources: [] };
    const html = renderToStaticMarkup(createElement(PlayerArticle, { player, narrativeDate: "2026-11-24" }));
    expect(html).toContain("IGL / Rifler");
    expect(html).not.toContain("League of Legends");
    expect(html).not.toContain("KDA");
    checkSections(html, ["team-history", "individual-awards", "tournament-results"]);
  });

  it("renders former roster entries without marking them active", () => {
    const team = { ...catalog.teams[0]!, formerRoster: [{ ...catalog.teams[0]!.roster[0]!,
      tenureId: "test-former-tenure", rosterStatus: "departed", leftDate: "2026-11-01" }] };
    const html = renderToStaticMarkup(createElement(TeamArticle, { team }));
    expect(html).toContain("2026-11-01");
    expect(html).not.toContain("No former players recorded.");
  });

  it.each(["League of Legends", "Counter-Strike"])("renders tournament sections for %s without invented data", (gameName) => {
    const tournament: CompetitionView = {
      id: "test-cup", slug: "test-cup", name: "Test Cup", gameId: "test-game", gameName,
      status: "planned", overview: null, format: [], organizer: null, location: null,
      startDate: null, endDate: null, prizePool: null, prizes: [], participants: [], results: [], awards: [], sources: [],
    };
    const html = renderToStaticMarkup(createElement(TournamentArticle, { tournament }));
    checkSections(html, ["overview", "tournament-information", "prize-pool", "participants", "results", "mvps"]);
    expect(html).toContain("No confirmed participants recorded.");
    expect(html).toContain("No MVPs or individual awards recorded.");
    expect(html).not.toContain("$");
  });

  it("does not publish tournament fixtures or change the publication scope", () => {
    expect(catalog.competitions).toEqual([]);
    expect(catalog.routes).not.toContain("/wiki/competitions/test-cup");
    expect(catalog.teams.map((team) => team.id)).toEqual(["kairos-lol-main"]);
    expect(catalog.players.every((player) => player.tournamentResults.length === 0 && player.awards.length === 0)).toBe(true);
  });

  it("rejects tournaments with unpublished participants, unconfirmed status or reversed dates", () => {
    const universe = loadCanonUniverse();
    const manifest = { ...loadPublicationManifest(), enabledCompetitions: ["test-cup"] };
    const record = { id: "test-cup", slug: "test-cup", name: "Test Cup", gameId: "game-league-of-legends",
      status: "planned", canonStatus: "confirmed", sourceIds: [], participantTeamIds: ["hidden-team"] };
    universe.collections.competitions = [record];
    const build = () => buildCompetitionViews(universe, manifest, catalog.teams, catalog.players, () => []);
    expect(build).toThrow(/participant/);
    universe.collections.competitions = [{ ...record, participantTeamIds: [], canonStatus: "unconfirmed" }];
    expect(build).toThrow(/not confirmed/);
    universe.collections.competitions = [{ ...record, participantTeamIds: [], startDate: "2027-02-20", endDate: "2027-02-01" }];
    expect(build).toThrow(/before/);
  });
});
