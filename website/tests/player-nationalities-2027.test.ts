import { describe, expect, it } from "vitest";
import { loadExternalScene } from "@/lib/external/scene";
import { nationalitiesOf, regionCodeOfLeague, rosterSets, loadWorldState2027 } from "@/lib/external/worldState2027";
import { sceneTeamToTeamView } from "@/lib/external/teamView";

const worldState = loadWorldState2027();
const scene = loadExternalScene();
const viewOf = (slug: string) => {
  const reference = scene.teams.find((team) => team.slug === slug)!;
  return sceneTeamToTeamView(reference, scene, rosterSets(worldState), worldState);
};

describe("roster table regions and nationalities", () => {
  it("maps every league to the directed region code", () => {
    const expected: Record<string, string> = { LCK: "KR", "LCK Challengers": "KR", LPL: "CH", LDL: "CH", CBLOL: "SA", "Circuito Desafiante": "SA", LCP: "PCS", "LCP Challengers": "PCS", LEC: "EU", "EMEA Masters": "EU", LCS: "NA", NACL: "NA" };
    for (const [league, code] of Object.entries(expected)) expect(regionCodeOfLeague(worldState, league)).toBe(code);
  });

  it("gives every Korean and Chinese league player the league nationality", () => {
    expect(nationalitiesOf(worldState, "external-lol-player-faker", "LCK")).toEqual(["South Korea"]);
    expect(nationalitiesOf(worldState, "any-player", "LCK Challengers")).toEqual(["South Korea"]);
    expect(nationalitiesOf(worldState, "any-player", "LPL")).toEqual(["China"]);
    expect(nationalitiesOf(worldState, "any-player", "LDL")).toEqual(["China"]);
  });

  it("uses real nationalities for CBLOL, LCP and LEC and leaves unknowns blank", () => {
    expect(nationalitiesOf(worldState, "external-lol-player-wunder", "LEC")).toEqual(["Denmark"]);
    expect(nationalitiesOf(worldState, "external-lol-player-rest", "LCP")).toEqual(["Taiwan"]);
    expect(nationalitiesOf(worldState, "external-lol-player-ackerman", "CBLOL")).toEqual(["Argentina"]);
    expect(nationalitiesOf(worldState, "external-lol-player-popp", "LCP")).toEqual(["Vietnam"]);
    expect(nationalitiesOf(worldState, "external-lol-player-samikin", "LCP")).toEqual(["Cambodia"]);
  });

  it("shows the league region and the player's nationality on team roster rows", () => {
    const g2 = viewOf("external-g2-esports");
    expect(g2.roster.length).toBeGreaterThan(0);
    for (const entry of g2.roster) expect(entry.regionCode).toBe("EU");
    const t1 = viewOf("external-t1");
    for (const entry of t1.roster) {
      expect(entry.regionCode).toBe("KR");
      expect(entry.nationalities).toEqual(["South Korea"]);
    }
  });
});
