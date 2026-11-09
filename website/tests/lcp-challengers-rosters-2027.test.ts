import { describe, expect, it } from "vitest";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const lcp = worldState.lcpChallengersRosters;
const starters = lcp.teams.flatMap((team) => team.starters);
const nationalityOf = (nickname: string) => lcp.addedPlayers.find((player) => player.nickname === nickname)!.nationality;

describe("LCP Challengers 2027 rosters", () => {
  it("covers the eight LCP Challengers teams with forty starters, eight per role", () => {
    expect(lcp.league).toBe("LCP Challengers");
    expect(lcp.teams).toHaveLength(8);
    expect(starters).toHaveLength(40);
    const ecosystem = worldState.tier2Leagues["LCP Challengers"]!.teams.map((team) => team.teamId).sort();
    expect(lcp.teams.map((team) => team.teamId).sort()).toEqual(ecosystem);
    for (const role of ["top", "jungle", "mid", "bot", "support"]) expect(starters.filter((starter) => starter.role === role)).toHaveLength(8);
  });

  it("excludes ineligible players and players who already start in LCP 2027", () => {
    const names = new Set(starters.map((starter) => starter.nickname));
    for (const name of ["Tianzhen", "yaoyao", "Xi lai", "Yue", "Lucifer", "Goldc", "Leaky", "Yuhe", "Chain1"]) expect(names.has(name)).toBe(false);
    const ids = rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mixes Taiwan, Hong Kong, Vietnam and Japan and limits nationality to the four", () => {
    const nationalities = new Set(lcp.addedPlayers.map((player) => player.nationality).filter(Boolean));
    expect([...nationalities].sort()).toEqual(["Hong Kong", "Japan", "Taiwan", "Vietnam"]);
    expect(["Nern", "nTnT", "Vin"].map(nationalityOf)).toEqual(["Vietnam", "Vietnam", "Vietnam"]);
    expect(["HRK", "Jericho", "chico"].map(nationalityOf)).toEqual(["Japan", "Japan", "Japan"]);
    for (const nickname of ["Magicpig", "Dengleng", "Xiao Yu"]) expect(nationalityOf(nickname)).toBeNull();
  });

  it("is all nickname-only identities with no legal name or birth date", () => {
    expect(lcp.addedPlayers).toHaveLength(40);
    for (const player of lcp.addedPlayers) {
      expect(player.reviewStatus).toBe("author-named-identity-only");
      expect(player.legalName).toBeNull();
      expect(player.dateOfBirth).toBeNull();
    }
    expect(lcp.retirements).toEqual([]);
  });
});
