import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildTbdPattern } from "../src/lib/tournamentPattern";
import { loadWorldState2027 } from "../src/lib/external/worldState2027";

const root = path.resolve(__dirname, "../..");
const competitions = fs.readdirSync(path.join(root, "data/competitions")).filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(fs.readFileSync(path.join(root, "data/competitions", file), "utf8")))
  .filter((record) => record.gameId === "game-counter-strike");
const prizeNumber = (text: string) => Number(text.replace(/[^\d]/g, ""));

describe("Counter-Strike tournament page pattern", () => {
  it("gives every non-Major tournament 16 teams (Tier 1 and Tier 2) or 8 teams (Tier 3) with a calculated, fully TBD prize split", () => {
    const pattern = competitions.filter((record) => record.tier !== "major");
    expect(pattern).toHaveLength(47);
    for (const record of pattern) {
      const expected = record.tier === "tier-3" ? 8 : 16;
      expect(record.teamsCount, record.slug).toBe(expected);
      expect(record.prizeDistribution, record.slug).toHaveLength(expected);
      expect(record.prizeDistribution.every((prize: { teamId: string }) => prize.teamId === "TBD"), record.slug).toBe(true);
      const total = record.prizeDistribution.reduce((sum: number, prize: { prize: string }) => sum + prizeNumber(prize.prize), 0);
      expect(total, record.slug).toBe(prizeNumber(record.prizePool));
      expect(record.format.join(" "), record.slug).toMatch(/best of five/);
    }
  });

  it("leaves the Majors without an invented format", () => {
    for (const record of competitions.filter((entry) => entry.tier === "major")) {
      expect(record.teamsCount).toBe("TBD");
      expect(record.prizeDistribution).toEqual([]);
    }
  });

  it("builds the TBD pattern: 16 teams in four groups plus quarter-finals, 8 teams in two groups with semi-finals", () => {
    const sixteen = buildTbdPattern(16);
    expect(sixteen.groupStage.groups).toHaveLength(4);
    expect(sixteen.playoffs.rounds.map((round) => [round.name, round.matches.length, round.matchFormat])).toEqual([["Quarter-finals", 4, "Bo3"], ["Semi-finals", 2, "Bo3"], ["Grand final", 1, "Bo5"]]);
    const eight = buildTbdPattern(8);
    expect(eight.groupStage.groups).toHaveLength(2);
    expect(eight.playoffs.rounds.map((round) => round.name)).toEqual(["Semi-finals", "Grand final"]);
    for (const group of [...sixteen.groupStage.groups, ...eight.groupStage.groups]) {
      expect(group.teams.every((team) => team.tbd)).toBe(true);
      expect(group.matches).toHaveLength(6);
    }
  });

  it("keeps Kairos Gaming and Without a Roof in different CCT North America #1 groups", () => {
    const cct = loadWorldState2027().eventInvites.find((entry) => entry.competitionSlug === "cct-north-america-1-2027")!;
    const groupOf = (teamId: string) => cct.groupStage!.groups.findIndex((group) => group.teamIds.includes(teamId));
    const withoutARoof = cct.teams.find((team) => team.name === "Without a Roof")!.teamId;
    expect(groupOf("kairos-cs-main")).toBeGreaterThanOrEqual(0);
    expect(groupOf("kairos-cs-main")).not.toBe(groupOf(withoutARoof));
  });
});
