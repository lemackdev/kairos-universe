import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { fieldCaptionFor, loadWorldState2027, regionalFieldFor } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const invites = worldState.eventInvites;

describe("IEM Dallas 2027 invited teams", () => {
  it("lists exactly sixteen distinct external Counter-Strike teams", () => {
    expect(invites.teams).toHaveLength(16);
    expect(new Set(invites.teams.map((team) => team.teamId)).size).toBe(16);
    const known = new Set(worldState.csExternalRosters.teams.map((team) => team.teamId));
    for (const team of invites.teams) expect(known.has(team.teamId)).toBe(true);
    expect(invites.teams.map((team) => team.name)).toEqual([
      "Team Vitality", "Spirit", "MOUZ", "FURIA", "Falcons", "Aurora", "Natus Vincere", "G2 Esports",
      "FaZe", "Astralis", "BC.Game", "Team Liquid", "M80", "MIBR", "paiN Gaming", "Legacy",
    ]);
  });

  it("excludes Kairos teams and Chicken Coop", () => {
    for (const team of invites.teams) {
      expect(team.teamId.startsWith("kairos-")).toBe(false);
      expect(team.name.toLowerCase()).not.toContain("chicken");
    }
  });

  it("feeds the event page field and caption, and establishes no format or results", () => {
    expect(regionalFieldFor(worldState, "iem-dallas-2027")).toHaveLength(16);
    expect(fieldCaptionFor(worldState, "iem-dallas-2027")).toBe("Invited teams (2027)");
    expect(fieldCaptionFor(worldState, "lck-2027")).toBe("Participants (2027)");
    expect(invites.inviteDate).toBeNull();
    expect(invites.notEstablished.join(" ")).toMatch(/results/);
  });

  it("never states why a team was invited", () => {
    const files = [
      path.join(repositoryRoot, "data", "competitive-world-overrides", "iem-dallas-invites-2027.json"),
      path.join(repositoryRoot, "docs", "canon", "IEM_DALLAS_2027_INVITES.md"),
      path.join(repositoryRoot, "data", "competitions", "iem-dallas-2027.json"),
    ];
    for (const file of files) expect(fs.readFileSync(file, "utf8")).not.toMatch(/contender|storyline|big-stage|connection|favou?rite|reason/i);
  });
});
