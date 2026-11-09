import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { loadExternalScene } from "@/lib/external/scene";
import { sceneTeamToTeamView } from "@/lib/external/teamView";
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

  it("records exactly eleven retirements (Loki's retirement was reversed) and keeps them out of lineups and free agency", () => {
    expect(lcsRosters.retirements).toHaveLength(11);
    expect(lcsRosters.retirements.some((entry) => entry.playerId === "external-lol-player-loki")).toBe(false);
    expect(lcsRosters.departures.some((entry) => entry.playerId === "external-lol-player-loki")).toBe(false);
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

describe("2027 roster reconciliation", () => {
  const views = scene.teams.map((team) => ({ team, view: sceneTeamToTeamView(team, scene, lcsRosters) }));
  const assigned = new Set([
    ...lcsRosters.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)),
    ...lcsRosters.retirements.map((retirement) => retirement.playerId),
  ]);

  it("derives departures from the 2026 tenures of every reassigned or retired player", () => {
    const destination = new Map(lcsRosters.teams.flatMap((team) => team.starters.map((starter) => [starter.playerId, team.teamId] as const)));
    const expected = scene.rosterTenures
      .filter((tenure) => assigned.has(tenure.playerId) && destination.get(tenure.playerId) !== tenure.teamId)
      .map((tenure) => tenure.id).sort();
    expect(lcsRosters.departures.map((entry) => entry.tenureId).sort()).toEqual(expected);
  });

  it("keeps every reassigned or retired player active on at most one team and retirees on none", () => {
    const retiredIds = new Set(lcsRosters.retirements.map((entry) => entry.playerId));
    const appearances = new Map<string, number>();
    for (const { view } of views) for (const entry of view.roster) appearances.set(entry.playerId, (appearances.get(entry.playerId) ?? 0) + 1);
    for (const playerId of assigned) {
      const count = appearances.get(playerId) ?? 0;
      expect(count).toBeLessThanOrEqual(1);
      if (retiredIds.has(playerId)) expect(count).toBe(0);
    }
    for (const team of lcsRosters.teams.filter((entry) => !entry.internal)) {
      expect(views.find((entry) => entry.team.id === team.teamId)!.view.roster).toHaveLength(5);
    }
  });

  it("moves departed players to the former list without deleting their 2026 tenures", () => {
    for (const departure of lcsRosters.departures) {
      const { team, view } = views.find((entry) => entry.team.id === departure.teamId)!;
      expect(view.roster.some((entry) => entry.playerId === departure.playerId)).toBe(false);
      expect(view.formerRoster.some((entry) => entry.playerId === departure.playerId)).toBe(true);
      expect(team.rosterTenureIds).toContain(departure.tenureId);
    }
  });

  it("leaves vacancies empty and only on teams without a confirmed lineup", () => {
    const lineupIds = new Set(lcsRosters.teams.map((team) => team.teamId));
    expect(lcsRosters.vacancies).toEqual([]);
    for (const vacancy of lcsRosters.vacancies) {
      expect(lineupIds.has(vacancy.teamId)).toBe(false);
      const { view } = views.find((entry) => entry.team.id === vacancy.teamId)!;
      expect(view.roster.some((entry) => entry.role === vacancy.role && scene.rosterTenures.find((t) => t.playerId === entry.playerId && t.teamId === vacancy.teamId)?.designation === "main")).toBe(false);
    }
  });

  it("does not touch Kairos League or Counter-Strike team records", () => {
    for (const id of ["kairos-lol-main", "kairos-lol-academy-blue", "kairos-lol-academy-white", "kairos-cs-main", "kairos-cs-academy"]) {
      expect(lcsRosters.departures.some((entry) => entry.teamId === id)).toBe(false);
      expect(lcsRosters.vacancies.some((entry) => entry.teamId === id)).toBe(false);
    }
  });
});
