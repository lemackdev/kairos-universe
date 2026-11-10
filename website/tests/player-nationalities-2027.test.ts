import { describe, expect, it } from "vitest";
import { loadExternalScene } from "@/lib/external/scene";
import { csRoleOf, legalNameOf, organizationOverviewOf, nationalitiesOf, regionCodeOfLeague, rosterSets, loadWorldState2027 } from "@/lib/external/worldState2027";
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

describe("Leaguepedia legal names", () => {
  it("fills legal names for resolved nickname-only players and skips unresolved ones", () => {
    expect(legalNameOf(worldState, "external-lol-player-guli")).toBe("Igor Oblizajek");
    expect(legalNameOf(worldState, "external-lol-player-garden")).toBe("Seo Jeong-won");
    expect(legalNameOf(worldState, "external-lol-player-popp")).toBe("Phạm Hoàng Phúc");
    expect(legalNameOf(worldState, "external-lol-player-pun-nacl")).toBeNull();
    expect(nationalitiesOf(worldState, "external-lol-player-guli", "EMEA Masters")).toEqual(["Poland"]);
  });
});

describe("CS player roles", () => {
  it("assigns AWPer, IGL and Rifler from HLTV role icons", () => {
    expect(csRoleOf(worldState, "external-cs-player-zywoo")).toBe("AWPer");
    expect(csRoleOf(worldState, "external-cs-player-apex")).toBe("IGL / Rifler");
    expect(csRoleOf(worldState, "external-cs-player-donk")).toBe("Rifler");
    expect(csRoleOf(worldState, "external-cs-player-jame")).toBe("IGL / AWPer");
  });
});

describe("organization overviews", () => {
  it("covers every external organization and does not mention the fictional universe", () => {
    const all = Object.values(worldState.organizationOverviews.organizations);
    expect(all.length).toBeGreaterThanOrEqual(107);
    for (const entry of all) { expect(entry.overview.length).toBeGreaterThan(40); expect(entry.overview).not.toMatch(/Kairos/i); }
    expect(organizationOverviewOf(worldState, "external-lol-org-t1")).toMatch(/SK Telecom/);
  });
});
