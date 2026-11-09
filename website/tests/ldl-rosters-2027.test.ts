import { describe, expect, it } from "vitest";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const ldl = worldState.ldlRosters;
const starters = ldl.teams.flatMap((team) => team.starters);

describe("LDL 2027 rosters", () => {
  it("covers the eight LDL teams with forty starters, eight per role", () => {
    expect(ldl.league).toBe("LDL");
    expect(ldl.teams).toHaveLength(8);
    expect(starters).toHaveLength(40);
    const ecosystem = worldState.tier2Leagues.LDL!.teams.map((team) => team.teamId).sort();
    expect(ldl.teams.map((team) => team.teamId).sort()).toEqual(ecosystem);
    for (const role of ["top", "jungle", "mid", "bot", "support"]) expect(starters.filter((starter) => starter.role === role)).toHaveLength(8);
  });

  it("excludes the players already starting or retired in LPL 2027", () => {
    const names = new Set(starters.map((starter) => starter.nickname));
    for (const name of ["ZUIAN", "Nia", "Erha", "Moham", "sinian"]) expect(names.has(name)).toBe(false);
    const ids = rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("retires thirteen surplus players and keeps them out of every lineup", () => {
    expect(ldl.retirements).toHaveLength(13);
    const startIds = new Set(starters.map((starter) => starter.playerId));
    for (const entry of ldl.retirements) expect(startIds.has(entry.playerId)).toBe(false);
  });

  it("clears Heru and Tyrion from free agents and invents no biography", () => {
    const freeAgents = new Set(worldState.freeAgents.players.map((player) => player.playerId));
    expect(freeAgents.has("external-lol-player-heru")).toBe(false);
    expect(freeAgents.has("external-lol-player-tyrion")).toBe(false);
    expect(ldl.departures.map((entry) => entry.nickname).sort()).toEqual(["Heru", "Starry", "Tyrion", "re0"]);
    expect(ldl.addedPlayers).toHaveLength(49);
    for (const player of ldl.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.nationality).toBeNull();
    }
  });
});
