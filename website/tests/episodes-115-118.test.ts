import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const episodes = [115, 116, 117, 118].map((n) => read(`data/episodes/episode-${n}.json`));

describe("episodes 115-118", () => {
  it("are indexed with their archived prose and a source record", () => {
    const index: string[] = read("index/episodes.json");
    for (const episode of episodes) {
      expect(index).toContain(`data/episodes/${episode.id}.json`);
      expect(episode.canonStatus).toBe("confirmed");
      const prose = fs.readFileSync(path.join(root, episode.sourceReferences[0].sourcePath), "utf8");
      expect(prose.toLowerCase().startsWith(`episódio ${episode.episodeNumber}`)).toBe(true);
      expect(prose.length).toBeGreaterThan(15000);
    }
    expect(read("index/sources.json")).toContain("data/sources/source-episodes-115-118.json");
  });

  it("keep the 2027-01-28 and 2027-01-29 chronology", () => {
    expect(episodes.map((episode) => episode.exactStoryDate)).toEqual(["2027-01-28", "2027-01-28", "2027-01-28", "2027-01-29"]);
  });

  it("appoint Tarik without inventing contract or administrative terms", () => {
    const tenure = read("data/staff-tenures/tarik-kairos-cs-academy-head-coach-kairos-cs-academy.json");
    expect(tenure.title).toBe("Head Coach");
    expect(tenure.teamId).toBe("kairos-cs-academy");
    const coach = read("data/coaches/tarik-kairos-cs-academy-head-coach.json");
    expect(coach.realName).toBe("TBD");
    expect(read("data/teams/kairos-counter-strike-academy.json").coachingStaff).toContain(coach.id);
    expect(read("data/teams/kairos-counter-strike.json").coachingStaff).toContain("lukas-luk-novak");
    const stewie = read("data/coaches/jake-stewie2k-yip.json");
    expect(stewie.individualTimeline.some((line: string) => line.startsWith("Episode 117 (2027-01-28)"))).toBe(true);
    expect(stewie.individualTimeline.some((line: string) => line.startsWith("Episode 118 (2027-01-29)"))).toBe(false);
  });

  it("registers scrims as private practice that never affects standings", () => {
    const files = fs.readdirSync(path.join(root, "data/matches")).filter((file) => /independent-(exercise|5-games)/.test(file));
    expect(files).toHaveLength(4);
    for (const file of files) {
      const match = read(`data/matches/${file}`);
      expect(match.matchType).toBe("private-scrim");
      expect(match.officialStatus).toBe("practice");
      expect(match.affectsStandings).toBe(false);
    }
    const totals = Object.fromEntries(["main", "academy-blue", "academy-white"].map((team) => {
      const match = read(`data/matches/match-lol-external-${team}-independent-5-games-2027-01-29.json`);
      return [team, [match.teamAScore, match.teamBScore]];
    }));
    expect(totals).toEqual({ main: [3, 2], "academy-blue": [2, 3], "academy-white": [1, 4] });
  });

  it("add the announcement date to the IEM Dallas and CCT invites without changing the lists", () => {
    const iem = read("data/competitive-world-overrides/iem-dallas-invites-2027.json");
    const cct = read("data/competitive-world-overrides/cct-north-america-1-invites-2027.json");
    expect(iem.inviteDate).toBe("2027-01-28");
    expect(cct.inviteDate).toBe("2027-01-28");
    expect(iem.teams).toHaveLength(16);
    expect(cct.teams.map((team: { name: string }) => team.name)).toContain("Kairos Gaming");
    expect(iem.teams.map((team: { name: string }) => team.name)).not.toContain("Kairos Gaming");
  });
});
