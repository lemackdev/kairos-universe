import { describe, expect, it } from "vitest";
import { loadExternalScene } from "@/lib/external/scene";
import { sceneTeamToTeamView } from "@/lib/external/teamView";
import { loadWorldState2027 } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const { lecRosters, lcsRosters, freeAgents } = worldState;
const scene = loadExternalScene();
const starters = lecRosters.teams.flatMap((team) => team.starters);

describe("2027 LEC rosters", () => {
  it("covers eight teams and forty identified positions", () => {
    expect(lecRosters.teams).toHaveLength(8);
    expect(starters).toHaveLength(40);
    expect(lecRosters.pendingIdentities ?? []).toHaveLength(0);
    expect(new Set(starters.map((starter) => starter.playerId)).size).toBe(starters.length);
    expect(lecRosters.addedPlayers.map((player) => player.nickname)).toEqual(expect.arrayContaining(["Zoelys", "Myrtus"]));
  });

  it("uses the corrected Elyoya identity", () => {
    const vitality = lecRosters.teams.find((team) => team.teamId === "external-lol-team-team-vitality")!;
    expect(vitality.starters.find((entry) => entry.role === "jungle")?.playerId).toBe("external-lol-player-elyoya");
    expect(starters.some((entry) => /elyolya/i.test(entry.nickname))).toBe(false);
  });

  it("registers fourteen retirements and keeps retirees out of lineups and free agency", () => {
    expect(lecRosters.retirements).toHaveLength(14);
    const starterIds = new Set(starters.map((entry) => entry.playerId));
    const freeAgentIds = new Set(freeAgents.players.map((entry) => entry.playerId));
    for (const retirement of lecRosters.retirements) {
      expect(starterIds.has(retirement.playerId)).toBe(false);
      expect(freeAgentIds.has(retirement.playerId)).toBe(false);
      expect(scene.players.some((player) => player.id === retirement.playerId)).toBe(true);
    }
    expect(lecRosters.retirements.find((entry) => entry.nickname === "Isma")?.previousTeamName).toBe("GIANTX");
    expect(lecRosters.retirements.find((entry) => entry.nickname === "Skeanz")?.previousTeamName).toBe("SK Gaming");
    expect(lecRosters.retirements.find((entry) => entry.nickname === "Sheo")?.previousTeamName).toBe("Shifters");
  });

  it("keeps Busio and jojopyun on their LCS teams; kyeahoo and Poby moved on to the LCK", () => {
    const lcsAssignments = new Map(lcsRosters.teams.flatMap((team) => team.starters.map((entry) => [entry.playerId, team.name] as const)));
    expect(lcsAssignments.get("external-lol-player-busio")).toBe("Cloud9");
    expect(lcsAssignments.get("external-lol-player-jojopyun")).toBe("Team Liquid");
    const market = lecRosters.marketAvailability ?? [];
    expect(market).toHaveLength(0);
    const lckStarters = new Map(worldState.lckRosters.teams.flatMap((team) => team.starters.map((entry) => [entry.nickname, team.name] as const)));
    expect(lckStarters.get("kyeahoo")).toBe("Hanwha Life Esports");
    expect(lckStarters.get("Poby")).toBe("SOOPers");
    const assigned = new Set([...starters, ...lcsRosters.teams.flatMap((team) => team.starters)].map((entry) => entry.playerId));
    for (const entry of market) {
      expect(entry.eligibleRegion).toBe("KR");
      expect(assigned.has(entry.playerId)).toBe(false);
      expect(lecRosters.retirements.some((retirement) => retirement.playerId === entry.playerId)).toBe(false);
    }
  });

  it("overlay identities do not duplicate scene players and carry no invented dates", () => {
    for (const added of lecRosters.addedPlayers) {
      expect(scene.players.some((player) => player.id === added.playerId)).toBe(false);
      expect(scene.players.some((player) => player.nickname.toLowerCase() === added.nickname.toLowerCase())).toBe(false);
    }
    expect(lecRosters.confirmedBy).toBeNull();
  });

  it("never lists a player as an active starter on two teams across LCS and LEC", () => {
    const views = scene.teams.map((team) => sceneTeamToTeamView(team, scene, [lcsRosters, lecRosters]));
    const seen = new Map<string, number>();
    for (const view of views) for (const entry of view.roster) seen.set(entry.playerId, (seen.get(entry.playerId) ?? 0) + 1);
    for (const id of [...starters.map((entry) => entry.playerId), ...lecRosters.retirements.map((entry) => entry.playerId)]) {
      expect(seen.get(id) ?? 0).toBeLessThanOrEqual(1);
    }
    for (const retirement of lecRosters.retirements) expect(seen.get(retirement.playerId) ?? 0).toBe(0);
    for (const entry of lecRosters.marketAvailability ?? []) expect(seen.get(entry.playerId) ?? 0).toBe(0);
    for (const team of lecRosters.teams) {
      const view = views.find((entry) => entry.id === team.teamId)!;
      const pending = (lecRosters.pendingIdentities ?? []).filter((entry) => entry.teamId === team.teamId).length;
      expect(view.roster).toHaveLength(5 - pending);
    }
  });

  it("preserves 2026 tenures for every departure and avoids duplicate departures across sets", () => {
    const lcsTenures = new Set(lcsRosters.departures.map((entry) => entry.tenureId));
    for (const departure of lecRosters.departures) {
      expect(lcsTenures.has(departure.tenureId)).toBe(false);
      const team = scene.teams.find((entry) => entry.id === departure.teamId)!;
      expect(team.rosterTenureIds).toContain(departure.tenureId);
    }
  });

  it("does not touch Kairos or Counter-Strike records", () => {
    for (const id of ["kairos-lol-main", "kairos-lol-academy-blue", "kairos-lol-academy-white", "kairos-cs-main", "kairos-cs-academy"]) {
      expect(lecRosters.teams.some((entry) => entry.teamId === id)).toBe(false);
      expect(lecRosters.departures.some((entry) => entry.teamId === id)).toBe(false);
    }
  });
});
