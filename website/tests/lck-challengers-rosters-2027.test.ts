import { describe, expect, it } from "vitest";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const lck = worldState.lckChallengersRosters;
const starters = lck.teams.flatMap((team) => team.starters);

describe("LCK Challengers 2027 rosters", () => {
  it("covers the eight LCK Challengers teams with forty starters, eight per role", () => {
    expect(lck.league).toBe("LCK Challengers");
    expect(lck.teams).toHaveLength(8);
    expect(starters).toHaveLength(40);
    const ecosystem = worldState.tier2Leagues["LCK Challengers"]!.teams.map((team) => team.teamId).sort();
    expect(lck.teams.map((team) => team.teamId).sort()).toEqual(ecosystem);
    for (const role of ["top", "jungle", "mid", "bot", "support"]) expect(starters.filter((starter) => starter.role === role)).toHaveLength(8);
  });

  it("excludes the players already starting or retired in LCK 2027", () => {
    const names = new Set(starters.map((starter) => starter.nickname));
    for (const name of ["Quantum", "Painter", "DDoiV", "Enosh", "Jiwoo", "FenRir", "Pleata", "Slayer", "Bluffing", "Rich"]) expect(names.has(name)).toBe(false);
    const ids = rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("retires the five surplus players and keeps them out of every lineup", () => {
    expect(lck.retirements.map((entry) => entry.nickname).sort()).toEqual(["Courage", "DDahyuk", "Kemish", "Ripple", "Tempester"]);
    const startIds = new Set(starters.map((starter) => starter.playerId));
    for (const entry of lck.retirements) expect(startIds.has(entry.playerId)).toBe(false);
  });

  it("moves only Ghost and Pollu off their 2026 KT Rolster tenures and invents no biography", () => {
    expect(lck.departures.map((entry) => entry.nickname).sort()).toEqual(["Ghost", "Pollu"]);
    expect(lck.addedPlayers).toHaveLength(43);
    for (const player of lck.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.nationality).toBeNull();
      expect(player.dateOfBirth).toBeNull();
    }
  });
});
