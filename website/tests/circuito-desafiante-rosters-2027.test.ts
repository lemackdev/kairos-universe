import { describe, expect, it } from "vitest";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const cd = worldState.circuitoDesafianteRosters;
const starters = cd.teams.flatMap((team) => team.starters);
const nationalityOf = (nickname: string) => cd.addedPlayers.find((player) => player.nickname === nickname)?.nationality;
const spanish = new Set(["Argentina", "Chile", "Peru"]);

describe("Circuito Desafiante 2027 rosters", () => {
  it("covers the eight Circuito Desafiante teams with forty starters, eight per role", () => {
    expect(cd.league).toBe("Circuito Desafiante");
    expect(cd.teams).toHaveLength(8);
    expect(starters).toHaveLength(40);
    const ecosystem = worldState.tier2Leagues["Circuito Desafiante"]!.teams.map((team) => team.teamId).sort();
    expect(cd.teams.map((team) => team.teamId).sort()).toEqual(ecosystem);
    for (const role of ["top", "jungle", "mid", "bot", "support"]) expect(starters.filter((starter) => starter.role === role)).toHaveLength(8);
  });

  it("fields only Spanish-speaking players at Estral Esports and 7REX, and Brazilians elsewhere", () => {
    for (const team of cd.teams) {
      const spanishTeam = ["Estral Esports", "7REX"].includes(team.name);
      for (const starter of team.starters) {
        const nationality = nationalityOf(starter.nickname);
        if (starter.nickname === "Manel") continue;
        expect(spanishTeam ? spanish.has(nationality ?? "") : nationality === "Brazil", `${team.name} ${starter.nickname}`).toBe(true);
      }
    }
  });

  it("excludes ineligible and already-used players and creates no surplus or retirements", () => {
    const names = new Set(starters.map((starter) => starter.nickname));
    for (const name of ["Bwipo", "Envy", "Brance", "Telas", "Leleko", "Netuno", "Yupps", "Grevthar", "Namiru", "Viciun", "Relax", "Snok"]) expect(names.has(name)).toBe(false);
    const ids = rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    expect(new Set(ids).size).toBe(ids.length);
    expect(cd.retirements).toEqual([]);
    expect(cd.addedPlayers).toHaveLength(39);
  });

  it("moves only Manel off his 2026 tenure and invents no biography", () => {
    expect(cd.departures.map((entry) => entry.nickname)).toEqual(["Manel"]);
    for (const player of cd.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.dateOfBirth).toBeNull();
    }
  });
});
