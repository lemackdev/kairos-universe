import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repositoryRoot } from "@/lib/canon/paths";
import { fieldCaptionFor, loadWorldState2027, regionalFieldFor } from "@/lib/external/worldState2027";

const worldState = loadWorldState2027();
const cct = worldState.eventInvites.find((entry) => entry.competitionSlug === "cct-north-america-1-2027")!;
const dallas = worldState.eventInvites.find((entry) => entry.competitionSlug === "iem-dallas-2027")!;

describe("CCT North America #1 2027 invited teams", () => {
  it("lists sixteen distinct Counter-Strike teams including Kairos Gaming", () => {
    expect(cct.teams).toHaveLength(16);
    expect(new Set(cct.teams.map((team) => team.teamId)).size).toBe(16);
    expect(cct.teams.some((team) => team.teamId === "kairos-cs-main")).toBe(true);
    const external = new Set(worldState.csExternalRosters.teams.map((team) => team.teamId));
    for (const team of cct.teams) expect(team.teamId === "kairos-cs-main" || external.has(team.teamId)).toBe(true);
    expect(cct.teams.some((team) => team.name === "Marsborne")).toBe(false);
  });

  it("shares no team with IEM Dallas and excludes Kairos Academy and Chicken Coop", () => {
    const dallasIds = new Set(dallas.teams.map((team) => team.teamId));
    for (const team of cct.teams) {
      expect(dallasIds.has(team.teamId)).toBe(false);
      expect(team.teamId).not.toBe("kairos-cs-academy");
      expect(team.name.toLowerCase()).not.toContain("chicken");
    }
  });

  it("feeds the event page field and establishes no format or results", () => {
    expect(regionalFieldFor(worldState, "cct-north-america-1-2027")).toHaveLength(16);
    expect(fieldCaptionFor(worldState, "cct-north-america-1-2027")).toBe("Invited teams (2027)");
    expect(cct.inviteDate).toBe("2027-01-28");
  });

  it("never states why a team was invited", () => {
    const files = [
      path.join(repositoryRoot, "data", "competitive-world-overrides", "cct-north-america-1-invites-2027.json"),
      path.join(repositoryRoot, "docs", "canon", "CCT_NORTH_AMERICA_1_2027_INVITES.md"),
      path.join(repositoryRoot, "data", "competitions", "cct-north-america-1-2027.json"),
    ];
    for (const file of files) expect(fs.readFileSync(file, "utf8")).not.toMatch(/contender|storyline|big-stage|connection|favou?rite|reason/i);
  });
});
