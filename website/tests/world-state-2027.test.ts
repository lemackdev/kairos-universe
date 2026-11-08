import { beforeAll, describe, expect, it } from "vitest";
import type { KairospediaCatalog } from "@/types/catalog";
import { buildCatalog } from "@/lib/catalog/build";
import { loadCanonUniverse, loadPublicationManifest } from "@/lib/canon/loader";
import { filterScene, loadExternalScene } from "@/lib/external/scene";
import { findTier2Team, listAllTier2Teams, loadWorldState2027, regionalFieldFor } from "@/lib/external/worldState2027";

let catalog: KairospediaCatalog;

beforeAll(() => {
  catalog = buildCatalog(loadCanonUniverse(), loadPublicationManifest());
  catalog.externalScene = filterScene(loadExternalScene(), ["LCK", "LPL", "LEC", "CBLOL", "LCS", "LCP", "NACL"]);
  catalog.worldState2027 = loadWorldState2027();
});

const removed = {
  LPL: ["external-lol-team-thundertalk-gaming", "external-lol-team-ultra-prime", "external-lol-team-ninjas-in-pyjamas", "external-lol-team-team-we", "external-lol-team-edward-gaming", "external-lol-team-lgd-gaming"],
  LCK: ["external-lol-team-drx", "external-lol-team-fearx"],
  LEC: ["external-lol-team-shifters", "external-lol-team-team-heretics"],
  LCS: ["external-lol-team-disguised"],
  NACL: ["external-lol-team-ccg-esports", "external-lol-team-contingent-esports", "external-lol-team-conviction", "external-lol-team-cupid-esports"],
};

describe("2027 League regional restructuring", () => {
  it("has exactly 8 active teams in every tracked region", () => {
    const regions = catalog.worldState2027!.membership.regions;
    for (const league of ["LCK", "LPL", "LEC", "LCS", "LCP", "CBLOL", "NACL"]) {
      expect(regions[league]!.active).toHaveLength(8);
    }
  });

  it("Tier 1 total is exactly 48 active teams", () => {
    const regions = catalog.worldState2027!.membership.regions;
    const tier1 = ["LCK", "LPL", "LEC", "LCS", "LCP", "CBLOL"];
    expect(tier1.reduce((sum, league) => sum + regions[league]!.active.length, 0)).toBe(48);
  });

  it("every removed organization is inactive in its region, not active, and not deleted", () => {
    const regions = catalog.worldState2027!.membership.regions;
    const scene = catalog.externalScene!;
    for (const [league, teamIds] of Object.entries(removed)) {
      for (const teamId of teamIds) {
        expect(regions[league]!.active.some((team) => team.teamId === teamId)).toBe(false);
        expect(regions[league]!.inactive.some((team) => team.teamId === teamId)).toBe(true);
        expect(scene.teams.some((team) => team.id === teamId)).toBe(true);
      }
    }
  });

  it("Disguised is inactive in LCS 2027 and Kairos Gaming is active", () => {
    const lcs = catalog.worldState2027!.membership.regions.LCS!;
    expect(lcs.inactive.some((team) => team.teamId === "external-lol-team-disguised")).toBe(true);
    expect(lcs.active.some((team) => team.teamId === "kairos-lol-main")).toBe(true);
    const competition = catalog.competitions.find((c) => c.slug === "lcs-2027");
    expect(competition?.participants).toEqual([{ id: "kairos-lol-main", name: "Kairos Gaming", slug: "kairos-lol-main" }]);
  });

  it("NRG stays active and no replacement is invented for its withdrawn substitute slot", () => {
    const nacl = catalog.worldState2027!.membership.regions.NACL!;
    expect(nacl.active.some((team) => team.teamId === "external-lol-team-nrg")).toBe(true);
    const nrgTeam = catalog.externalScene!.teams.find((t) => t.id === "external-lol-team-nrg")!;
    expect(nrgTeam.rosterTenureIds.length).toBe(6);
    expect(catalog.externalScene!.players.some((p) => p.id === "external-lol-player-shogo")).toBe(false);
    expect(catalog.worldState2027!.freeAgents.players.some((p) => p.playerId === "external-lol-player-shogo")).toBe(false);
  });

  it("NACL 2027 has exactly the confirmed 8 active teams, using existing records with no duplicates", () => {
    const nacl = catalog.worldState2027!.membership.regions.NACL!;
    const names = nacl.active.map((t) => t.name).sort();
    expect(names).toEqual(["Blue Otter", "Dorado Gaming", "Kairos Academy Blue", "Maryville University", "NRG", "Sentinels", "University of Mississippi", "Winthrop University"].sort());
    const blue = nacl.active.find((t) => t.name === "Kairos Academy Blue")!;
    expect(blue.teamId).toBe("kairos-lol-academy-blue");
    expect(catalog.teams.filter((t) => t.id === "kairos-lol-academy-blue")).toHaveLength(1);
  });

  it("Sentinels' NACL participant is distinct from its Tier 1 LCS team, and both stay active in their own region", () => {
    const nacl = catalog.worldState2027!.membership.regions.NACL!;
    const lcs = catalog.worldState2027!.membership.regions.LCS!;
    const naclSentinels = nacl.active.find((t) => t.name === "Sentinels")!;
    expect(naclSentinels.teamId).not.toBe("external-lol-team-sentinels");
    expect(naclSentinels.parentTeamId).toBe("external-lol-team-sentinels");
    expect(lcs.active.some((t) => t.teamId === "external-lol-team-sentinels")).toBe(true);
  });

  it("Kairos Academy White is not an NACL participant and stays separate from Academy Blue and Kairos Main", () => {
    const nacl = catalog.worldState2027!.membership.regions.NACL!;
    const lcs = catalog.worldState2027!.membership.regions.LCS!;
    expect(nacl.active.some((t) => t.teamId === "kairos-lol-academy-white")).toBe(false);
    expect(nacl.inactive.some((t) => t.teamId === "kairos-lol-academy-white")).toBe(false);
    expect(nacl.active.some((t) => t.teamId === "kairos-lol-main")).toBe(false);
    expect(lcs.active.some((t) => t.teamId === "kairos-lol-main")).toBe(true);
  });

  it("Conviction and Cupid eSports exit NACL and are flagged distinctly where undirected", () => {
    const nacl = catalog.worldState2027!.membership.regions.NACL!;
    const conviction = nacl.inactive.find((t) => t.teamId === "external-lol-team-conviction")!;
    const cupid = nacl.inactive.find((t) => t.teamId === "external-lol-team-cupid-esports")!;
    expect(conviction).toBeDefined();
    expect(cupid).toBeDefined();
    expect(cupid.note).toMatch(/Not named in the author's confirmed/);
  });

  it("all removed-team players remain in the database as free agents unless a destination or retirement is confirmed", () => {
    const scene = catalog.externalScene!;
    const freeAgentIds = new Set(catalog.worldState2027!.freeAgents.players.map((p) => p.playerId));
    const resolvedIds = new Set([
      ...catalog.worldState2027!.lcsRosters.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)),
      ...catalog.worldState2027!.lcsRosters.retirements.map((retirement) => retirement.playerId),
      ...catalog.worldState2027!.lecRosters.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)),
      ...catalog.worldState2027!.lecRosters.retirements.map((retirement) => retirement.playerId),
      ...(catalog.worldState2027!.lecRosters.marketAvailability ?? []).map((entry) => entry.playerId),
      ...[catalog.worldState2027!.lplRosters, catalog.worldState2027!.cblolRosters, catalog.worldState2027!.lckRosters, catalog.worldState2027!.lcpRosters].flatMap((set) => [
        ...set.teams.flatMap((team) => team.starters.map((starter) => starter.playerId)),
        ...set.retirements.map((retirement) => retirement.playerId),
        ...(set.marketAvailability ?? []).map((entry) => entry.playerId),
      ]),
    ]);
    for (const teamIds of Object.values(removed)) {
      for (const teamId of teamIds) {
        const team = scene.teams.find((t) => t.id === teamId)!;
        for (const tenureId of team.rosterTenureIds) {
          const tenure = scene.rosterTenures.find((t) => t.id === tenureId)!;
          expect(scene.players.some((p) => p.id === tenure.playerId)).toBe(true);
          expect(freeAgentIds.has(tenure.playerId) !== resolvedIds.has(tenure.playerId)).toBe(true);
        }
      }
    }
  });

  it("frozen 2026 reference scene is untouched by the 2027 layer (counts match the original research)", () => {
    const scene = catalog.externalScene!;
    const counts: Record<string, number> = { LCK: 10, LPL: 14, LEC: 10, CBLOL: 8, LCS: 8, LCP: 8, NACL: 10 };
    for (const [league, count] of Object.entries(counts)) {
      expect(scene.teams.filter((t) => t.league === league).length).toBe(count);
    }
  });

  it("Crossroads Cup regional allocation is unchanged", () => {
    const event = catalog.competitions.find((c) => c.slug === "crossroads-cup-2027");
    expect(event?.teamsCount).toBe(16);
    expect(event?.format.some((line) => line.includes("LCK 3"))).toBe(true);
    expect(event?.format.some((line) => line.includes("LCP 2"))).toBe(true);
  });

  it("no 2027 regional membership or free-agent record references an unknown team or player", () => {
    const scene = catalog.externalScene!;
    const knownTeamIds = new Set([...catalog.teams.map((t) => t.id), ...scene.teams.map((t) => t.id)]);
    const knownPlayerIds = new Set(scene.players.map((p) => p.id));
    for (const region of Object.values(catalog.worldState2027!.membership.regions)) {
      for (const team of [...region.active, ...region.inactive]) {
        const known = knownTeamIds.has(team.teamId) || (team.parentTeamId !== undefined && knownTeamIds.has(team.parentTeamId));
        expect(known).toBe(true);
      }
    }
    for (const player of catalog.worldState2027!.freeAgents.players) expect(knownPlayerIds.has(player.playerId)).toBe(true);
  });
});

describe("2027 League Tier 2 regional ecosystems", () => {
  const expectedTeams: Record<string, string[]> = {
    "EMEA Masters": ["Galions", "Solary", "Movistar KOI Fénix", "Anubis Gaming", "ILN Pirates", "Kaufland Hangry Knights", "G2 NORD", "Karmine Corp Blue"],
    "LCK Challengers": ["T1 Esports Academy", "Dplus Kia Challengers", "KT Rolster Challengers", "Nongshim Esports Academy", "DN SOOPers Challengers", "Kiwoom DRX Challengers", "BNK FEARX Youth", "Hanwha Life Esports Challengers"],
    "LCP Challengers": ["CFO Academy", "Frank Esports", "SillySilly Gaming", "Reignfall", "Sponge Gaming", "EWH", "Ground Zero Academy", "RogerSaMa"],
    "Circuito Desafiante": ["Estral Esports", "KaBuM! IDL", "VKS Academy", "INTZ", "RMD Gaming", "Ei Nerd Esports", "paiN Academy", "7REX"],
    LDL: ["BLG Junior", "TES Challenger", "Oh My God", "EDG Youth Team", "WBG Youth Team", "LGD Young Team", "WE Academy", "AL Young"],
  };

  it("each ecosystem has exactly 8 teams matching the confirmed names, and is Tier 2 with the right region", () => {
    const regions: Record<string, string> = { "EMEA Masters": "Europe / EMEA", "LCK Challengers": "Korea", "LCP Challengers": "Pacific", "Circuito Desafiante": "Brazil", LDL: "China" };
    for (const [key, names] of Object.entries(expectedTeams)) {
      const league = catalog.worldState2027!.tier2Leagues[key]!;
      expect(league.tier).toBe("regional-tier-2");
      expect(league.region).toBe(regions[key]);
      expect(league.teams.map((t) => t.name)).toEqual(names);
    }
  });

  it("Tier 2 teams stay distinct entities from their Tier 1 parent/brand organizations", () => {
    const lck = catalog.worldState2027!.tier2Leagues["LCK Challengers"]!;
    expect(lck.teams.find((t) => t.name === "Kiwoom DRX Challengers")?.parentTeamId).toBe("external-lol-team-drx");
    expect(lck.teams.find((t) => t.name === "BNK FEARX Youth")?.parentTeamId).toBe("external-lol-team-fearx");
    const emea = catalog.worldState2027!.tier2Leagues["EMEA Masters"]!;
    expect(emea.teams.every((t) => t.parentTeamId === null)).toBe(true);
    const teamIds = Object.values(catalog.worldState2027!.tier2Leagues).flatMap((l) => l.teams.map((t) => t.teamId));
    expect(new Set(teamIds).size).toBe(teamIds.length);
  });

  it("DRX and FEARX Tier 2 academies stay active despite their Tier 1 exit", () => {
    const lck = catalog.worldState2027!.tier2Leagues["LCK Challengers"]!;
    expect(lck.teams.some((t) => t.name === "Kiwoom DRX Challengers")).toBe(true);
    expect(lck.teams.some((t) => t.name === "BNK FEARX Youth")).toBe(true);
    const lckTier1 = catalog.worldState2027!.membership.regions.LCK!;
    expect(lckTier1.inactive.some((t) => t.teamId === "external-lol-team-drx")).toBe(true);
    expect(lckTier1.inactive.some((t) => t.teamId === "external-lol-team-fearx")).toBe(true);
  });

  it("LDL teams stay distinct from LPL Tier 1 parents, and EDG/LGD/WE academies stay active despite their Tier 1 exit", () => {
    const ldl = catalog.worldState2027!.tier2Leagues.LDL!;
    const omg = ldl.teams.find((t) => t.name === "Oh My God")!;
    expect(omg.teamId).not.toBe("external-lol-team-oh-my-god");
    expect(omg.parentTeamId).toBe("external-lol-team-oh-my-god");
    const lpl = catalog.worldState2027!.membership.regions.LPL!;
    expect(lpl.active.some((t) => t.teamId === "external-lol-team-oh-my-god")).toBe(true);

    const pairs: Array<[string, string]> = [["EDG Youth Team", "external-lol-team-edward-gaming"], ["LGD Young Team", "external-lol-team-lgd-gaming"], ["WE Academy", "external-lol-team-team-we"]];
    for (const [name, parentId] of pairs) {
      expect(ldl.teams.some((t) => t.name === name)).toBe(true);
      expect(ldl.teams.find((t) => t.name === name)?.parentTeamId).toBe(parentId);
      expect(lpl.inactive.some((t) => t.teamId === parentId)).toBe(true);
    }
  });

  it("no Tier 2 team gets automatic international qualification and no results/standings are modeled", () => {
    for (const league of Object.values(catalog.worldState2027!.tier2Leagues)) {
      for (const team of league.teams) {
        expect(team).not.toHaveProperty("placement");
        expect(team).not.toHaveProperty("wins");
        expect(team).not.toHaveProperty("qualified");
      }
    }
  });

  it("every Tier 2 parent reference resolves to a known pre-Worlds 2026 team", () => {
    const scene = catalog.externalScene!;
    const knownTeamIds = new Set(scene.teams.map((t) => t.id));
    for (const league of Object.values(catalog.worldState2027!.tier2Leagues)) {
      for (const team of league.teams) if (team.parentTeamId) expect(knownTeamIds.has(team.parentTeamId)).toBe(true);
    }
  });

  it("the renamed Tier 2 competition records carry 8 teamsCount and no duplicate parallel competition exists", () => {
    const slugs = ["lec-tier-2-2027", "lck-tier-2-2027", "lcp-tier-2-2027", "cblol-tier-2-2027", "lcs-tier-2-2027", "lpl-tier-2-2027"];
    const names = ["EMEA Masters 2027", "LCK Challengers 2027", "LCP Challengers 2027", "Circuito Desafiante 2027", "NACL 2027", "LDL 2027"];
    for (let i = 0; i < slugs.length; i++) {
      const competition = catalog.competitions.find((c) => c.slug === slugs[i]);
      expect(competition?.name).toBe(names[i]);
      expect(competition?.teamsCount).toBe(8);
      expect(competition?.tier).toBe("regional-tier-2");
    }
    expect(catalog.competitions.filter((c) => c.slug.includes("nacl") || c.slug.includes("ldl"))).toHaveLength(0);
  });

  it("every tracked regional competition slug resolves its full 2027 field via regionalFieldFor", () => {
    const slugs: Record<string, number> = {
      "lck-2027": 8, "lpl-2027": 8, "lec-2027": 8, "lcs-2027": 8, "lcp-2027": 8, "cblol-2027": 8,
      "lcs-tier-2-2027": 8, "lec-tier-2-2027": 8, "lck-tier-2-2027": 8, "lcp-tier-2-2027": 8, "cblol-tier-2-2027": 8, "lpl-tier-2-2027": 8,
    };
    for (const [slug, count] of Object.entries(slugs)) {
      const field = regionalFieldFor(catalog.worldState2027, slug);
      expect(field).toHaveLength(count);
    }
    expect(regionalFieldFor(catalog.worldState2027, "not-a-real-competition")).toBeNull();
  });

  it("every Tier 2 team is reachable by findTier2Team and listAllTier2Teams agree on the total", () => {
    const all = listAllTier2Teams(catalog.worldState2027);
    expect(all).toHaveLength(41);
    for (const team of all) {
      const found = findTier2Team(catalog.worldState2027, team.teamId);
      expect(found?.name).toBe(team.name);
    }
    expect(findTier2Team(catalog.worldState2027, "not-a-real-team")).toBeNull();
  });

  it("all six Tier 2 ecosystems total 48 teams, matching the 48 Tier 1 active teams for 96 combined", () => {
    const tier1 = ["LCK", "LPL", "LEC", "LCS", "LCP", "CBLOL"];
    const tier1Count = tier1.reduce((sum, league) => sum + catalog.worldState2027!.membership.regions[league]!.active.length, 0);
    const naclCount = catalog.worldState2027!.membership.regions.NACL!.active.length;
    const otherTier2Count = Object.values(catalog.worldState2027!.tier2Leagues).reduce((sum, league) => sum + league.teams.length, 0);
    expect(tier1Count).toBe(48);
    expect(naclCount + otherTier2Count).toBe(48);
    expect(tier1Count + naclCount + otherTier2Count).toBe(96);
  });
});
