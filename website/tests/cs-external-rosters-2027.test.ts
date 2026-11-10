import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { loadExternalScene } from "@/lib/external/scene";
import { loadWorldState2027 } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const { csExternalRosters: cs, csRosterFreeze: freeze } = worldState;
const scene = loadExternalScene();
const starters = cs.teams.flatMap((team) => team.starters);
const read = (relative: string) => JSON.parse(fs.readFileSync(path.join(repositoryRoot, relative), "utf8"));

describe("2027 external Counter-Strike 2 rosters", () => {
  it("has 50 teams, five starters each and 250 unique assignments", () => {
    expect(cs.teams).toHaveLength(50);
    for (const team of cs.teams) expect(team.starters).toHaveLength(5);
    expect(starters).toHaveLength(250);
    expect(new Set(starters.map((entry) => entry.playerId)).size).toBe(250);
    expect(new Set(cs.teams.map((team) => team.hltvTeamId)).size).toBe(50);
  });

  it("excludes Chicken Coop completely", () => {
    const text = JSON.stringify([cs, freeze]);
    expect(text).not.toMatch(/chicken coop|13107/i);
    expect(cs.players.some((player) => ["Wolffe", "stesso", "Crisp"].includes(player.nickname))).toBe(false);
  });

  it("gives every created player a nickname, full name and nationality with accents intact", () => {
    expect(cs.players).toHaveLength(249);
    for (const player of cs.players) {
      expect(player.nickname && player.legalName && player.nationality).toBeTruthy();
      expect(player.game).toBe("Counter-Strike 2");
    }
    const hallzerk = cs.players.find((player) => player.nickname === "hallzerk")!;
    expect(hallzerk.legalName).toBe("Håkon Fjærli");
    expect(cs.players.find((player) => player.nickname === "XANTARES")?.nationality).toBe("Türkiye");
    expect(cs.players.find((player) => player.nickname === "torzsi")?.legalName).toBe("Ádám Torzsás");
  });

  it("invents no roles, birth dates, contracts or results", () => {
    const text = JSON.stringify(cs);
    expect(text).not.toMatch(/"(role|dateOfBirth|joinedDate|contractEnd|salary|rating|ranking)"/);
    for (const team of cs.teams) for (const starter of team.starters) expect(Object.keys(starter).sort()).toEqual(["identity", "nickname", "playerId"]);
  });

  it("reuses the eleven confirmed League organizations and creates no duplicate global identity", () => {
    const reused = cs.teams.filter((team) => team.organizationAction === "existing-organization-cs-team-created");
    expect(reused.map((team) => team.organizationId).sort()).toEqual([
      "external-lol-org-fluxo-w7m", "external-lol-org-flyquest", "external-lol-org-fnatic", "external-lol-org-furia", "external-lol-org-g2-esports",
      "external-lol-org-natus-vincere", "external-lol-org-ninjas-in-pyjamas", "external-lol-org-nrg", "external-lol-org-pain-gaming",
      "external-lol-org-team-liquid", "external-lol-org-team-vitality",
    ]);
    const sceneOrgIds = new Set(scene.organizations.map((org) => org.id));
    for (const team of reused) {
      expect(sceneOrgIds.has(team.organizationId!)).toBe(true);
      expect(scene.teams.some((lol) => lol.id === team.teamId)).toBe(false);
    }
    expect(cs.organizations).toHaveLength(39);
    for (const org of cs.organizations) {
      expect(sceneOrgIds.has(org.organizationId)).toBe(false);
      expect(scene.organizations.some((entry) => entry.name.toLowerCase() === org.name.toLowerCase())).toBe(false);
    }
    expect(new Set(cs.teams.map((team) => team.teamId)).size).toBe(50);
  });

  it("links Fluxo CS to the shared Fluxo W7M organization", () => {
    const fluxo = cs.teams.find((team) => team.spreadsheetName === "Fluxo")!;
    expect(fluxo.hltvTeamId).toBe("11837");
    expect(fluxo.organizationId).toBe("external-lol-org-fluxo-w7m");
    expect(fluxo.organizationAction).toBe("existing-organization-cs-team-created");
  });

  it("keeps ambiguous same-name organizations distinct", () => {
    expect(cs.teams.find((team) => team.spreadsheetName === "OG")?.hltvTeamId).toBe("10503");
    for (const name of ["Imperial", "Alliance", "HEROIC", "OG"]) {
      expect(cs.teams.find((team) => team.spreadsheetName === name)?.organizationAction).toBe("new-organization-created");
    }
    expect(cs.teams.find((team) => team.spreadsheetName === "Liquid")?.organizationId).toBe("external-lol-org-team-liquid");
  });

  it("reuses Jake Yip for Stewie2K without a second identity, leaving his coach tenure intact", () => {
    const wor = cs.teams.find((team) => team.spreadsheetName === "Without a Roof")!;
    const stewie = wor.starters.find((starter) => starter.nickname === "Stewie2K")!;
    expect(stewie.playerId).toBe("jake-stewie2k-yip");
    expect(stewie.identity).toBe("existing-canon-person");
    expect(cs.players.some((player) => /stewie2k/i.test(player.nickname) || /^jake yip$/i.test(player.legalName))).toBe(false);
    expect(wor.starters.map((starter) => starter.nickname).sort()).toEqual(["CeRq", "FaNg", "Stewie2K", "autimatic", "Brehze"].sort());
    const tenure = read("data/staff-tenures/jake-stewie2k-yip-kairos-cs-academy.json");
    expect(tenure.endedDate).toBeNull();
    expect(tenure.status).toBe("active");
    const entry = cs.continuityCases[0]!;
    expect(entry.effectiveFrom).toBe("2027-01-29");
    expect(entry.status).toBe("accepted-sporting-proposal-former-kairos-employee");
    expect(entry.kairosCoachTenureEndDate).toBeNull();
    expect(entry.kairosAcademyRosterChanged).toBe(false);
  });

  it("keeps both Kairos Counter-Strike rosters unchanged; Tarik is registered only as Academy Head Coach after Episode 117", () => {
    const academy = read("data/teams/kairos-counter-strike-academy.json");
    expect(academy.coachingStaff).toContain("tarik-kairos-cs-academy-head-coach");
    expect(academy.roster).toEqual(freeze.preservedKairosRosters["kairos-cs-academy"]);
    expect(read("data/teams/kairos-counter-strike.json").roster).toEqual(freeze.preservedKairosRosters["kairos-cs-main"]);
    expect(fs.readdirSync(path.join(repositoryRoot, "data", "coaches")).filter((file) => /tarik/i.test(file))).toEqual(["tarik-kairos-cs-academy-head-coach.json"]);
    for (const id of starters.map((entry) => entry.playerId)) expect(Object.values(freeze.preservedKairosRosters).flat()).not.toContain(id);
  });

  it("extends the existing freeze through 2027-05-23 and invents no tournament data", () => {
    expect(freeze.freezeThrough).toBe("2027-05-23");
    expect(freeze.earliestLaterChangeDate).toBe("2027-05-24");
    expect(freeze.externalRosters).toMatchObject({ teamCount: 50, playerAssignmentCount: 250, directiveId: cs.directiveId });
    expect(cs.freezeDirectiveId).toBe(freeze.directiveId);
    expect(fs.readdirSync(path.join(repositoryRoot, "data", "competitive-world-overrides")).filter((file) => /counter-strike.*freeze/.test(file))).toHaveLength(1);
    expect(JSON.stringify(cs)).not.toMatch(/invitation|qualified for|\bplacements?\b|\bstandings?\b/i);
  });

  it("does not collide with League identities or contradict League rosters", () => {
    const scenePlayerIds = new Set(scene.players.map((player) => player.id));
    for (const player of cs.players) expect(scenePlayerIds.has(player.playerId)).toBe(false);
    const lolStarters = [...worldState.lcsRosters.teams, ...worldState.lecRosters.teams].flatMap((team) => team.starters.map((starter) => starter.playerId));
    for (const id of lolStarters) expect(starters.some((entry) => entry.playerId === id)).toBe(false);
  });
});
