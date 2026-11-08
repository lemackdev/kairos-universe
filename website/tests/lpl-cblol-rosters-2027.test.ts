import { describe, expect, it } from "vitest";
import { loadExternalScene } from "@/lib/external/scene";
import { sceneTeamToTeamView } from "@/lib/external/teamView";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const { lplRosters, cblolRosters, lcsRosters, lecRosters, freeAgents, membership } = worldState;
const scene = loadExternalScene();
const nicknames = (rosters: typeof lplRosters, teamName: string) => rosters.teams.find((team) => team.name === teamName)!.starters.map((starter) => starter.nickname);

describe("2027 LPL rosters", () => {
  it("covers eight active LPL teams and forty distinct starters", () => {
    expect(lplRosters.teams).toHaveLength(8);
    const starters = lplRosters.teams.flatMap((team) => team.starters);
    expect(starters).toHaveLength(40);
    expect(new Set(starters.map((entry) => entry.playerId)).size).toBe(40);
    const active = new Set(membership.regions.LPL!.active.map((team) => team.teamId));
    for (const team of lplRosters.teams) {
      expect(active.has(team.teamId)).toBe(true);
      expect(team.starters.map((entry) => entry.role)).toEqual(["top", "jungle", "mid", "bot", "support"]);
    }
  });

  it("applies the author lineup corrections and literal nicknames", () => {
    expect(nicknames(lplRosters, "LNG Esports")).toEqual(["Xiaoxu", "Monki", "Nia", "GALA", "MISSING"]);
    expect(nicknames(lplRosters, "Bilibili Gaming")[4]).toBe("ON");
    expect(nicknames(lplRosters, "Top Esports")).toEqual(["sheer", "Xiaohao", "Care", "1xn", "Zhuo"]);
    expect(nicknames(lplRosters, "Oh My God")).toEqual(["Zdz", "Junhao", "Tangyuan", "Photic", "Erha"]);
    expect(nicknames(lplRosters, "JD Gaming")[0]).toBe("ZUIAN");
  });

  it("registers exactly thirteen retirements and never retires Xiaohao, Zdz or Tangyuan", () => {
    expect(lplRosters.retirements).toHaveLength(13);
    const retired = new Set(lplRosters.retirements.map((entry) => entry.nickname.toLowerCase()));
    for (const nick of ["xiaohao", "zdz", "tangyuan"]) expect(retired.has(nick)).toBe(false);
    for (const nick of ["Moham", "Karis", "About", "HOYA", "Ycx", "Rookie", "Tarzan", "Jiejie", "sinian", "Leave", "Heng", "Shaoye", "Crisp"]) expect(retired.has(nick.toLowerCase())).toBe(true);
  });

  it("leaves Chinese, Korean and PCS market players unassigned", () => {
    const market = lplRosters.marketAvailability ?? [];
    expect(market.map((entry) => entry.nickname).sort()).toEqual(["Burdol", "Feather", "Keshi", "Viper", "fengyue"].sort());
    const regions = Object.fromEntries(market.map((entry) => [entry.nickname, entry.eligibleRegion]));
    expect(regions.Keshi).toBe("CN");
    expect(regions.Viper).toBe("KR");
    for (const nick of ["TheShy", "BuLLDoG", "Kael", "JunJia"]) expect(market.some((entry) => entry.nickname === nick)).toBe(false);
    const assigned = new Set(rosterSets(worldState).flatMap((set) => set.teams.flatMap((team) => team.starters.map((entry) => entry.playerId))));
    const retired = new Set(rosterSets(worldState).flatMap((set) => set.retirements.map((entry) => entry.playerId)));
    for (const entry of market) {
      expect(assigned.has(entry.playerId)).toBe(false);
      expect(retired.has(entry.playerId)).toBe(false);
    }
  });
});

describe("2027 CBLOL rosters", () => {
  it("covers eight active CBLOL teams and forty distinct starters", () => {
    expect(cblolRosters.teams).toHaveLength(8);
    const starters = cblolRosters.teams.flatMap((team) => team.starters);
    expect(starters).toHaveLength(40);
    expect(new Set(starters.map((entry) => entry.playerId)).size).toBe(40);
    const active = new Set(membership.regions.CBLOL!.active.map((team) => team.teamId));
    for (const team of cblolRosters.teams) expect(active.has(team.teamId)).toBe(true);
  });

  it("registers exactly ten retirements without inheriting blank organizations", () => {
    expect(cblolRosters.retirements).toHaveLength(10);
    const byNick = new Map(cblolRosters.retirements.map((entry) => [entry.nickname, entry.previousTeamName]));
    expect(byNick.get("Peach")).toBe("Fluxo W7M");
    expect(byNick.get("Keine")).toBe("paiN Gaming");
    expect(byNick.get("Kaze")).toBe("LOUD");
    expect(byNick.get("Zest")).toBe("LOS");
  });

  it("keeps author capitalization and identifies overlay players", () => {
    expect(nicknames(cblolRosters, "Fluxo W7M")).toEqual(["Zothve", "Josedeodo", "cody", "Viciun", "Ackerman"]);
    expect(nicknames(cblolRosters, "LOUD")).toEqual(["Guigo", "Disamis", "Envy", "Rabelo", "Telas"]);
    expect(nicknames(cblolRosters, "RED Canids")[4]).toBe("frosty");
  });
});

describe("LPL and CBLOL cross-database rules", () => {
  const all = [lplRosters, cblolRosters];
  const sets = rosterSets(worldState);

  it("never lists a player on two lineups and never lets a retired player start", () => {
    const starters = sets.flatMap((set) => set.teams.flatMap((team) => team.starters.map((entry) => entry.playerId)));
    expect(new Set(starters).size).toBe(starters.length);
    const retired = sets.flatMap((set) => set.retirements.map((entry) => entry.playerId));
    expect(new Set(retired).size).toBe(retired.length);
    for (const id of retired) expect(starters.includes(id)).toBe(false);
  });

  it("removes contradictory free-agent records but keeps them as prior status", () => {
    const freeIds = new Set(freeAgents.players.map((entry) => entry.playerId));
    for (const set of all) {
      for (const team of set.teams) for (const starter of team.starters) expect(freeIds.has(starter.playerId)).toBe(false);
      for (const entry of set.retirements) expect(freeIds.has(entry.playerId)).toBe(false);
    }
    const monki = lplRosters.teams.find((team) => team.name === "LNG Esports")!.starters.find((entry) => entry.nickname === "Monki")!;
    expect(monki.priorStatus?.previousTeamName).toBe("Team WE");
  });

  it("does not reactivate inactive organizations or change regional membership", () => {
    for (const id of ["external-lol-team-team-we", "external-lol-team-edward-gaming", "external-lol-team-lgd-gaming", "external-lol-team-ninjas-in-pyjamas", "external-lol-team-thundertalk-gaming"]) {
      expect(lplRosters.teams.some((team) => team.teamId === id)).toBe(false);
    }
    expect(membership.regions.LPL!.active).toHaveLength(8);
    expect(membership.regions.CBLOL!.active).toHaveLength(8);
  });

  it("supersedes only real 2026 tenures and shows no starter or retiree on a previous team", () => {
    for (const set of all) {
      for (const departure of set.departures) {
        const team = scene.teams.find((entry) => entry.id === departure.teamId)!;
        expect(team.rosterTenureIds).toContain(departure.tenureId);
      }
    }
    const views = scene.teams.map((team) => sceneTeamToTeamView(team, scene, sets));
    const seen = new Map<string, number>();
    for (const view of views) for (const entry of view.roster) seen.set(entry.playerId, (seen.get(entry.playerId) ?? 0) + 1);
    for (const set of all) {
      for (const team of set.teams) for (const starter of team.starters) expect(seen.get(starter.playerId)).toBe(1);
      for (const entry of set.retirements) expect(seen.get(entry.playerId) ?? 0).toBe(0);
    }
  });

  it("leaves LCS, LEC and Counter-Strike lineups untouched and invents no competitive data", () => {
    expect(lcsRosters.teams).toHaveLength(8);
    expect(lecRosters.teams).toHaveLength(8);
    expect(worldState.csExternalRosters.teams).toHaveLength(50);
    for (const set of all) {
      expect(set.confirmedBy).toBeNull();
      expect(JSON.stringify({ ...set, disclaimer: undefined })).not.toMatch(/\bplacements?\b|\bstandings?\b|\bsalary\b|\boverall\b|\bpotential\b/i);
      for (const id of ["kairos-lol-main", "kairos-lol-academy-blue", "kairos-lol-academy-white"]) expect(set.teams.some((team) => team.teamId === id)).toBe(false);
    }
  });

  it("does not invent biography for nickname-only identities", () => {
    for (const nick of ["Viciun", "Telas", "Yupps", "Netuno"]) {
      const added = all.flatMap((set) => set.addedPlayers).find((entry) => entry.nickname === nick)!;
      expect(added.legalName).toBeNull();
      expect(added.nationality).toBeNull();
      expect(added.dateOfBirth).toBeNull();
    }
  });
});
