import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const numbers = [119, 120, 121, 122, 123, 124, 125, 126, 127, 128];
const episodes = numbers.map((n) => read(`data/episodes/episode-${n}.json`));

describe("episodes 119-128", () => {
  it("are indexed with their archived prose and a source record", () => {
    const index: string[] = read("index/episodes.json");
    for (const episode of episodes) {
      expect(index).toContain(`data/episodes/${episode.id}.json`);
      expect(episode.canonStatus).toBe("confirmed");
      const prose = fs.readFileSync(path.join(root, episode.sourceReferences[0].sourcePath), "utf8");
      expect(prose.toLowerCase().startsWith(`episódio ${episode.episodeNumber}`)).toBe(true);
      expect(prose.length).toBeGreaterThan(25000);
    }
    expect(read("index/sources.json")).toContain("data/sources/source-episodes-119-128.json");
  });

  it("keep the chronology from 2027-01-30 to 2027-02-07", () => {
    expect(episodes.map((episode) => episode.exactStoryDate)).toEqual([
      "2027-01-30", "2027-01-31", "2027-02-01", "2027-02-01", "2027-02-02", "2027-02-03", "2027-02-04", "2027-02-05", "2027-02-06", "2027-02-07",
    ]);
    const version = read("kairos-version.json");
    expect(version.storyEpisode).toBe(128);
    expect(version.currentNarrativeDate).toBe("2027-02-07");
  });

  it("register every narrated private scrim as practice that affects no standing", () => {
    const matches = fs.readdirSync(path.join(root, "data/matches")).map((file) => read(`data/matches/${file}`)).filter((match) => match.relatedEpisodeIds.some((id: string) => numbers.map((n) => `episode-${n}`).includes(id)));
    expect(matches).toHaveLength(14);
    for (const match of matches) {
      expect(match.matchType).toBe("private-scrim");
      expect(match.officialStatus).toBe("practice");
      expect(match.affectsStandings).toBe(false);
    }
    const m80 = read("data/matches/match-cs-external-main-m80-2027-02-01.json");
    expect([m80.teamAScore, m80.teamBScore, m80.winnerTeamId]).toEqual([0, 2, "opponent-m80"]);
    const dignitas = read("data/matches/match-lol-external-main-dignitas-2027-02-01.json");
    expect([dignitas.teamAScore, dignitas.teamBScore]).toEqual([2, 1]);
  });

  it("appoint Xpecial on 2027-02-02 without inventing contract terms", () => {
    const coach = read("data/coaches/alex-xpecial-chu.json");
    expect(coach.firstAppearance).toBe("episode-123");
    expect(coach.joinedKairos).toBe("2027-02-02");
    expect(read("data/staff-tenures/alex-xpecial-chu-kairos-lol.json").startedDate).toBe("2027-02-02");
    expect(JSON.stringify(coach)).not.toMatch(/salary of|USD \d/);
  });

  it("register the CCT roster of six with Zayn as reserve and keep the draw of Episode 128", () => {
    const cct = read("data/competitive-world-overrides/cct-north-america-1-invites-2027.json");
    expect(cct.registeredRosters["kairos-cs-main"].reserve).toBe("zayn-parkinglot-haddad");
    expect(cct.registeredRosters["kairos-cs-main"].starters).toHaveLength(5);
    const groupD = cct.groupStage.groups.find((group: { name: string }) => group.name === "Group D");
    expect(groupD.teamIds.sort()).toEqual(["external-cs-team-betboom", "external-cs-team-fluxo", "external-cs-team-imperial", "kairos-cs-main"]);
    const first = groupD.matches.filter((match: { round: number }) => match.round === 1).map((match: { teamAId: string; teamBId: string }) => [match.teamAId, match.teamBId].sort().join("|"));
    expect(first).toContain(["external-cs-team-fluxo", "kairos-cs-main"].sort().join("|"));
    for (const group of cct.groupStage.groups) for (const match of group.matches) expect(match.mapsA).toBeNull();
  });

  it("publish the Portuguese ge.globo interview under a disclosed real-world publisher", () => {
    const article = read("data/publications/entrevista-ge-globo-flacogomez.json");
    expect(article.publisherId).toBe("ge-globo");
    expect(article.publicationDate).toBe("2027-02-05");
    expect(article.classification).toBe("in-universe-publication");
    expect(article.relatedPlayerIds).toEqual(["vincente-flacogomez-galan"]);
    expect(article.title.startsWith("Filho de brasileiros, jogador de CS")).toBe(true);
    expect(JSON.stringify(article.content)).toContain("Avanti, Palestra!");
    expect(JSON.stringify(article.content)).not.toMatch(/Tarik|quadro|Train/);
    expect(read("data/publishers/ge-globo.json").coverageDisclosure).toMatch(/^Internal provenance/);
    expect(read("index/publications.json")).toContain("data/publications/entrevista-ge-globo-flacogomez.json");
  });

  it("never state a medical diagnosis for Zayn or Arthur's discharge", () => {
    const text = [read("data/episodes/episode-119.json"), read("data/players/zayn-parkinglot-haddad.json"), read("data/episodes/episode-126.json"), read("data/characters/arthur-fletcher.json")].map((record) => JSON.stringify(record)).join(" ");
    expect(text).not.toMatch(/is autistic|diagnosed with autism|has autism/i);
    expect(text).not.toMatch(/was discharged|discharged on/i);
  });
});
