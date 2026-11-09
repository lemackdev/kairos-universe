import { describe, expect, it } from "vitest";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const emea = worldState.emeaMastersRosters;
const byTeam = (name: string) => emea.teams.find((team) => team.name === name)!.starters.map((starter) => `${starter.role}:${starter.nickname}`);

describe("EMEA Masters 2027 rosters", () => {
  it("covers the eight EMEA Masters teams with forty starters", () => {
    expect(emea.league).toBe("EMEA Masters");
    expect(emea.teams).toHaveLength(8);
    expect(emea.teams.flatMap((team) => team.starters)).toHaveLength(40);
    const ecosystem = worldState.tier2Leagues["EMEA Masters"]!.teams.map((team) => team.teamId).sort();
    expect(emea.teams.map((team) => team.teamId).sort()).toEqual(ecosystem);
  });

  it("has exactly eight players per role with Guli moved from Jungle to Mid", () => {
    for (const role of ["top", "jungle", "mid", "bot", "support"]) {
      expect(emea.teams.flatMap((team) => team.starters).filter((starter) => starter.role === role)).toHaveLength(8);
    }
    expect(emea.teams.flatMap((team) => team.starters).find((starter) => starter.nickname === "Guli")?.role).toBe("mid");
    expect(byTeam("TLN Pirates")).toEqual(["top:Boda", "jungle:Zicssi", "mid:Guli", "bot:Scorth", "support:Tockimo"]);
  });

  it("adds forty nickname-only identities and invents no biography", () => {
    expect(emea.addedPlayers).toHaveLength(40);
    for (const player of emea.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.nationality).toBeNull();
      expect(player.dateOfBirth).toBeNull();
    }
  });

  it("keeps the five LEC players out and every player on one lineup only", () => {
    const ids = rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    expect(new Set(ids).size).toBe(ids.length);
    const nicknames = new Set(emea.teams.flatMap((team) => team.starters.map((starter) => starter.nickname)));
    for (const name of ["Carlsen", "Aetinoth", "HARPOON", "Zoelys", "Kamiloo"]) expect(nicknames.has(name)).toBe(false);
  });
});
