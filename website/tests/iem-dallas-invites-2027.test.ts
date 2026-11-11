import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { fieldCaptionFor, groupStandings, loadWorldState2027, regionalFieldFor } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const invites = worldState.eventInvites.find((entry) => entry.competitionSlug === "iem-dallas-2027")!;

describe("IEM Dallas 2027 invited teams", () => {
  it("lists exactly sixteen distinct external Counter-Strike teams", () => {
    expect(invites.teams).toHaveLength(16);
    expect(new Set(invites.teams.map((team) => team.teamId)).size).toBe(16);
    const known = new Set(worldState.csExternalRosters.teams.map((team) => team.teamId));
    for (const team of invites.teams) expect(known.has(team.teamId)).toBe(true);
    expect(invites.teams.map((team) => team.name)).toEqual([
      "Team Vitality", "Spirit", "MOUZ", "FURIA", "Falcons", "Aurora", "Natus Vincere", "G2 Esports",
      "FaZe", "Astralis", "BC.Game", "Team Liquid", "M80", "MIBR", "paiN Gaming", "Legacy",
    ]);
  });

  it("excludes Kairos teams and Chicken Coop", () => {
    for (const team of invites.teams) {
      expect(team.teamId.startsWith("kairos-")).toBe(false);
      expect(team.name.toLowerCase()).not.toContain("chicken");
    }
  });

  it("feeds the event page field and caption, and establishes no format or results", () => {
    expect(regionalFieldFor(worldState, "iem-dallas-2027")).toHaveLength(16);
    expect(fieldCaptionFor(worldState, "iem-dallas-2027")).toBe("Invited teams (2027)");
    expect(fieldCaptionFor(worldState, "lck-2027")).toBe("Participants (2027)");
    expect(invites.inviteDate).toBe("2027-01-28");
    expect(invites.notEstablished.join(" ")).toMatch(/results/);
  });

  it("draws the sixteen invited teams into four groups of four, two advancing", () => {
    const stage = invites.groupStage!;
    expect(stage.groups.map((group) => group.name)).toEqual(["Group A", "Group B", "Group C", "Group D"]);
    for (const group of stage.groups) expect(group.teamIds).toHaveLength(4);
    expect(stage.advancing).toBe(2);
    expect(stage.groups.flatMap((group) => group.teamIds).sort()).toEqual(invites.teams.map((team) => team.teamId).sort());
  });

  it("lists all six Bo3 matches of every group with no result entered", () => {
    for (const group of invites.groupStage!.groups) {
      expect(group.matches).toHaveLength(6);
      for (const round of [1, 2, 3]) {
        const inRound = group.matches!.filter((match) => match.round === round);
        expect(inRound).toHaveLength(2);
        expect(new Set(inRound.flatMap((match) => [match.teamAId, match.teamBId])).size).toBe(4);
      }
      for (const match of group.matches!) {
        expect(match.format).toBe("Bo3");
        expect([match.mapsA, match.mapsB, match.roundsA, match.roundsB]).toEqual([null, null, null, null]);
      }
      expect(groupStandings(group, (id) => id).every((row) => row.wins === 0 && row.losses === 0 && row.roundDiff === 0)).toBe(true);
    }
  });

  it("derives standings from entered match results", () => {
    const group = { teamIds: ["a", "b", "c", "d"], matches: [
      { round: 1, teamAId: "a", teamBId: "b", format: "Bo3", mapsA: 2, mapsB: 0, roundsA: 26, roundsB: 14 },
      { round: 1, teamAId: "c", teamBId: "d", format: "Bo3", mapsA: 1, mapsB: 2, roundsA: 30, roundsB: 31 },
    ] };
    const rows = groupStandings(group, (id) => id);
    expect(rows.map((row) => row.teamId)).toEqual(["a", "d", "c", "b"]);
    expect(rows[0]).toMatchObject({ wins: 1, losses: 0, maps: 2, roundsWon: 26, roundsLost: 14, roundDiff: 12 });
    expect(rows[3]).toMatchObject({ wins: 0, losses: 1, roundDiff: -12 });
  });

  it("has an empty single-elimination playoff bracket for the eight advancing teams", () => {
    const rounds = invites.playoffs!.rounds;
    expect(rounds.map((round) => [round.name, round.matches.length])).toEqual([["Quarter-finals", 4], ["Semi-finals", 2], ["Grand final", 1]]);
    expect(rounds.map((round) => round.matchFormat)).toEqual(["Bo3", "Bo3", "Bo5"]);
    for (const match of rounds.flatMap((round) => round.matches)) expect([match.teamAId, match.teamBId]).toEqual([null, null]);
  });

  it("never states why a team was invited", () => {
    const files = [
      path.join(repositoryRoot, "data", "competitive-world-overrides", "iem-dallas-invites-2027.json"),
      path.join(repositoryRoot, "docs", "canon", "IEM_DALLAS_2027_INVITES.md"),
      path.join(repositoryRoot, "data", "competitions", "iem-dallas-2027.json"),
    ];
    for (const file of files) expect(fs.readFileSync(file, "utf8")).not.toMatch(/contender|storyline|big-stage|connection|favou?rite|reason/i);
  });
});
