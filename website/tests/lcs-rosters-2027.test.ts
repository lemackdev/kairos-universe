import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { loadExternalScene } from "@/lib/external/scene";
import { loadWorldState2027 } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const { lcsRosters, csRosterFreeze, freeAgents } = worldState;
const scene = loadExternalScene();
const readData = (relative: string) => JSON.parse(fs.readFileSync(path.join(repositoryRoot, relative), "utf8"));

describe("2027 LCS rosters", () => {
  it("covers eight teams and forty starting positions with no duplicate players", () => {
    expect(lcsRosters.teams).toHaveLength(8);
    const starters = lcsRosters.teams.flatMap((team) => team.starters);
    expect(starters).toHaveLength(40);
    expect(new Set(starters.map((starter) => starter.playerId)).size).toBe(40);
  });

  it("registers Spica as Sentinels Support", () => {
    const sentinels = lcsRosters.teams.find((team) => team.teamId === "external-lol-team-sentinels")!;
    expect(sentinels.starters.find((starter) => starter.playerId === "external-lol-player-spica")?.role).toBe("support");
  });

  it("reuses KryRa and adds eXyu only as an overlay identity", () => {
    const dignitas = lcsRosters.teams.find((team) => team.teamId === "external-lol-team-dignitas")!;
    expect(dignitas.starters.find((starter) => starter.role === "jungle")?.playerId).toBe("external-lol-player-kryra");
    expect(scene.players.some((player) => player.id === "external-lol-player-kryra")).toBe(true);
    expect(scene.players.some((player) => /exyu/i.test(player.nickname))).toBe(false);
    expect(lcsRosters.addedPlayers.map((player) => player.playerId)).toEqual(["external-lol-player-exyu"]);
    expect(lcsRosters.addedPlayers[0]!.dateOfBirth).toBe("2001-12-14");
  });

  it("records exactly twelve retirements and keeps them out of lineups and free agency", () => {
    expect(lcsRosters.retirements).toHaveLength(12);
    const starterIds = new Set(lcsRosters.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)));
    const freeAgentIds = new Set(freeAgents.players.map((player) => player.playerId));
    for (const retirement of lcsRosters.retirements) {
      expect(starterIds.has(retirement.playerId)).toBe(false);
      expect(freeAgentIds.has(retirement.playerId)).toBe(false);
      expect(scene.players.some((player) => player.id === retirement.playerId)).toBe(true);
    }
  });

  it("leaves no starter listed as a current free agent", () => {
    const freeAgentIds = new Set(freeAgents.players.map((player) => player.playerId));
    for (const team of lcsRosters.teams) for (const starter of team.starters) expect(freeAgentIds.has(starter.playerId)).toBe(false);
  });

  it("keeps Kairos Gaming's lineup on the existing internal players", () => {
    const kairos = lcsRosters.teams.find((team) => team.teamId === "kairos-lol-main")!;
    expect(kairos.starters.map((starter) => starter.playerId)).toEqual([
      "noah-rkn-bennett", "ethan-vanta-walker", "mason-404-brooks", "liam-aster-oconnor", "daniel-moss-reyes",
    ]);
  });
});

describe("Counter-Strike 2 external roster freeze", () => {
  it("runs through 2027-05-23 with 2027-05-24 as the earliest later change date", () => {
    expect(csRosterFreeze.freezeThrough).toBe("2027-05-23");
    expect(csRosterFreeze.earliestLaterChangeDate).toBe("2027-05-24");
    expect(csRosterFreeze.authorOverrideAllowed).toBe(true);
  });

  it("matches the Copenhagen Major dates and preserves both Kairos rosters", () => {
    const major = readData("data/competitions/pgl-copenhagen-major-2027.json");
    expect([major.startDate, major.endDate]).toEqual(["2027-05-07", "2027-05-23"]);
    expect(csRosterFreeze.preservedKairosRosters["kairos-cs-main"]).toHaveLength(5);
    expect(csRosterFreeze.preservedKairosRosters["kairos-cs-academy"]).toHaveLength(5);
    expect(major.participantTeamIds ?? []).toEqual([]);
  });
});
