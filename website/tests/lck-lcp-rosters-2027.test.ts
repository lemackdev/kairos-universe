import { describe, expect, it } from "vitest";
import { loadExternalScene } from "@/lib/external/scene";
import { sceneTeamToTeamView } from "@/lib/external/teamView";
import { loadWorldState2027, rosterSets } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const { lckRosters, lcpRosters, lcsRosters, freeAgents, membership } = worldState;
const scene = loadExternalScene();
const sets = rosterSets(worldState);
const roleOf = (rosters: typeof lckRosters, teamId: string, role: string) => rosters.teams.find((team) => team.teamId === teamId)!.starters.find((starter) => starter.role === role)!.nickname;
const nicknames = (rosters: typeof lckRosters, teamId: string) => rosters.teams.find((team) => team.teamId === teamId)!.starters.map((starter) => starter.nickname);

describe("2027 LCK rosters", () => {
  it("covers eight active LCK teams, forty starters, one per role, no vacancies", () => {
    expect(lckRosters.teams).toHaveLength(8);
    const starters = lckRosters.teams.flatMap((team) => team.starters);
    expect(starters).toHaveLength(40);
    expect(new Set(starters.map((entry) => entry.playerId)).size).toBe(40);
    const active = new Set(membership.regions.LCK!.active.map((team) => team.teamId));
    for (const team of lckRosters.teams) {
      expect(active.has(team.teamId)).toBe(true);
      expect(team.starters.map((entry) => entry.role)).toEqual(["top", "jungle", "mid", "bot", "support"]);
    }
    expect(lckRosters.vacancies).toHaveLength(0);
    expect(lckRosters.pendingIdentities ?? []).toHaveLength(0);
  });

  it("applies the author-critical lineup decisions", () => {
    expect(roleOf(lckRosters, "external-lol-team-dplus", "jungle")).toBe("Painter");
    expect(roleOf(lckRosters, "external-lol-team-brion", "mid")).toBe("Loki");
    expect(roleOf(lckRosters, "external-lol-team-nongshim-redforce", "bot")).toBe("Taeyoon");
    expect(roleOf(lckRosters, "external-lol-team-hanwha-life-esports", "support")).toBe("Effort");
    expect(roleOf(lckRosters, "external-lol-team-kt-rolster", "support")).toBe("Keria");
    expect(roleOf(lckRosters, "external-lol-team-t1", "mid")).toBe("ShowMaker");
    expect(nicknames(lckRosters, "external-lol-team-t1")).not.toContain("Faker");
  });

  it("registers exactly thirty-two distinct retirements with Diable once and no Loki or Taeyoon", () => {
    expect(lckRosters.retirements).toHaveLength(32);
    const ids = lckRosters.retirements.map((entry) => entry.playerId);
    expect(new Set(ids).size).toBe(32);
    expect(lckRosters.retirements.filter((entry) => entry.nickname === "Diable")).toHaveLength(1);
    const nicks = new Set(lckRosters.retirements.map((entry) => entry.nickname.toLowerCase()));
    expect(nicks.has("faker")).toBe(true);
    for (const nick of ["loki", "taeyoon"]) expect(nicks.has(nick)).toBe(false);
  });

  it("reverses Loki's LCS retirement without touching Cloud9's lineup", () => {
    expect(lcsRosters.retirements.some((entry) => entry.playerId === "external-lol-player-loki")).toBe(false);
    expect(lcsRosters.teams).toHaveLength(8);
    expect(lcsRosters.teams.some((team) => team.starters.some((entry) => entry.playerId === "external-lol-player-loki"))).toBe(false);
    const moved = lckRosters.departures.find((entry) => entry.playerId === "external-lol-player-loki")!;
    expect(moved.teamName).toBe("Cloud9");
    expect(moved.reason).toBe("transferred");
    expect(moved.destinationTeamName).toBe("BRION");
  });

  it("clears Taeyoon's free-agent status and keeps it as prior status", () => {
    expect(freeAgents.players.some((entry) => entry.playerId === "external-lol-player-taeyoon")).toBe(false);
    const nongshim = lckRosters.teams.find((team) => team.teamId === "external-lol-team-nongshim-redforce")!;
    expect(nongshim.starters.find((entry) => entry.nickname === "Taeyoon")!.priorStatus?.previousTeamName).toBe("FEARX");
  });

  it("reconciles confirmed incoming Korean players and leaves Burdol and Viper unassigned", () => {
    const where = new Map(lckRosters.teams.flatMap((team) => team.starters.map((entry) => [entry.nickname, team.name] as const)));
    expect(where.get("TheShy")).toBe("Dplus");
    expect(where.get("BuLLDoG")).toBe("Nongshim RedForce");
    expect(where.get("Kael")).toBe("T1");
    expect(where.get("kyeahoo")).toBe("Hanwha Life Esports");
    expect(where.get("Poby")).toBe("SOOPers");
    const market = sets.flatMap((set) => set.marketAvailability ?? []).map((entry) => entry.nickname);
    for (const nick of ["TheShy", "BuLLDoG", "Kael", "kyeahoo", "Poby", "JunJia"]) expect(market).not.toContain(nick);
    expect(market).toEqual(expect.arrayContaining(["Burdol", "Viper"]));
  });

  it("keeps FEARX and DRX inactive", () => {
    const inactive = new Set(membership.regions.LCK!.inactive.map((team) => team.teamId));
    expect(inactive.has("external-lol-team-fearx")).toBe(true);
    expect(inactive.has("external-lol-team-drx")).toBe(true);
    for (const id of inactive) expect(lckRosters.teams.some((team) => team.teamId === id)).toBe(false);
  });
});

describe("2027 LCP rosters", () => {
  it("covers eight active LCP teams, forty starters, no vacancies", () => {
    expect(lcpRosters.teams).toHaveLength(8);
    const starters = lcpRosters.teams.flatMap((team) => team.starters);
    expect(starters).toHaveLength(40);
    expect(new Set(starters.map((entry) => entry.playerId)).size).toBe(40);
    const active = new Set(membership.regions.LCP!.active.map((team) => team.teamId));
    for (const team of lcpRosters.teams) expect(active.has(team.teamId)).toBe(true);
    expect(lcpRosters.vacancies).toHaveLength(0);
  });

  it("assigns Chain1, JunJia and Uniboy as confirmed", () => {
    expect(roleOf(lcpRosters, "external-lol-team-softbank-hawks-gaming", "mid")).toBe("Chain1");
    expect(roleOf(lcpRosters, "external-lol-team-softbank-hawks-gaming", "jungle")).toBe("JunJia");
    expect(roleOf(lcpRosters, "external-lol-team-ctbc-flying-oyster", "mid")).toBe("Uniboy");
    const junjia = lcpRosters.departures.find((entry) => entry.playerId === "external-lol-player-junjia")!;
    expect(junjia.teamName).toBe("JD Gaming");
    expect(junjia.destinationTeamName).toBe("SoftBank HAWKS gaming");
    expect(worldState.lplRosters.teams.some((team) => team.starters.some((entry) => entry.nickname === "JunJia"))).toBe(false);
  });

  it("registers exactly nine retirements and no extra", () => {
    expect(lcpRosters.retirements.map((entry) => entry.nickname.toLowerCase()).sort()).toEqual(["aria", "citrus", "evi", "fisher", "hongsuo", "pout", "siuloong", "van1", "vsta"]);
  });
});

describe("LCK and LCP cross-database rules", () => {
  const all = [lckRosters, lcpRosters];

  it("never lists a player on two lineups or as starter and retired", () => {
    const starters = sets.flatMap((set) => set.teams.flatMap((team) => team.starters.map((entry) => entry.playerId)));
    expect(new Set(starters).size).toBe(starters.length);
    const retired = sets.flatMap((set) => set.retirements.map((entry) => entry.playerId));
    expect(new Set(retired).size).toBe(retired.length);
    for (const id of retired) expect(starters.includes(id)).toBe(false);
  });

  it("removes contradictory free-agent records and leaves other free agents alone", () => {
    const freeIds = new Set(freeAgents.players.map((entry) => entry.playerId));
    for (const set of all) {
      for (const team of set.teams) for (const starter of team.starters) expect(freeIds.has(starter.playerId)).toBe(false);
      for (const entry of set.retirements) expect(freeIds.has(entry.playerId)).toBe(false);
    }
    expect(freeIds.has("external-lol-player-frog")).toBe(true);
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
      for (const team of set.teams) for (const starter of team.starters) {
        if (scene.players.some((player) => player.id === starter.playerId)) expect(seen.get(starter.playerId)).toBe(1);
      }
      for (const entry of set.retirements) expect(seen.get(entry.playerId) ?? 0).toBe(0);
    }
  });

  it("invents no biography, dates or competitive data", () => {
    for (const set of all) {
      expect(set.confirmedBy).toBeNull();
      expect(JSON.stringify({ ...set, disclaimer: undefined })).not.toMatch(/\bplacements?\b|\bstandings?\b|\bsalary\b|\boverall\b|\bpotential\b/i);
    }
    for (const nick of ["Quantum", "Painter", "Slayer", "Pleata", "Popp", "Yuhe", "Hitzo"]) {
      const added = all.flatMap((set) => set.addedPlayers).find((entry) => entry.nickname === nick)!;
      expect(added.legalName).toBeNull();
      expect(added.nationality).toBeNull();
      expect(added.dateOfBirth).toBeNull();
    }
  });

  it("does not duplicate scene identities and leaves approved lineups intact", () => {
    for (const added of all.flatMap((set) => set.addedPlayers)) {
      expect(scene.players.some((player) => player.nickname.toLowerCase() === added.nickname.toLowerCase())).toBe(false);
    }
    expect(worldState.lecRosters.teams).toHaveLength(8);
    expect(worldState.lplRosters.teams).toHaveLength(8);
    expect(worldState.cblolRosters.teams).toHaveLength(8);
    expect(worldState.csExternalRosters.teams).toHaveLength(50);
  });
});
