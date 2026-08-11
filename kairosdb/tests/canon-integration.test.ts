import { describe, expect, it } from "vitest";

import { loadKairosLeaguePlayers, loadKairosLeagueTeam } from "../src/lib/canon/loader";
import { loadFictionalCanonIdentities } from "../scripts/leaguepedia/collisions";
import { buildNormalizedSnapshot, type ImportPolicy } from "../scripts/leaguepedia/normalize-core";

const REQUIRED_SLUGS = [
  "noah-rkn-bennett",
  "ethan-vanta-walker",
  "mason-404-brooks",
  "liam-aster-oconnor",
  "daniel-moss-reyes",
];

describe("Kairos canon integration (reads real repository data, read-only)", () => {
  it("the five published Kairos League players are all present", () => {
    const players = loadKairosLeaguePlayers();
    expect(players.map((p) => p.slug).sort()).toEqual([...REQUIRED_SLUGS].sort());
  });

  it("the Kairos League team is present with its full roster", () => {
    const team = loadKairosLeagueTeam();
    expect(team.roster.sort()).toEqual([...REQUIRED_SLUGS].sort());
  });

  it("fictional canon identities are discoverable for collision checks", () => {
    const fictional = loadFictionalCanonIdentities();
    for (const slug of REQUIRED_SLUGS) {
      expect(fictional.playerSlugs.has(slug)).toBe(true);
    }
    expect(fictional.playerNicknames.has("rkn")).toBe(true);
  });
});

describe("no Kairos player is overwritten by an external import", () => {
  it("an external player sharing rkN's page identity would still get a namespaced id, never the bare fictional id", () => {
    const fictional = loadFictionalCanonIdentities();
    const policy: ImportPolicy = {
      includeSubstitutes: true,
      includeTrainees: true,
      includeInactiveRosterMembers: true,
      includeCoachingStaff: true,
      includeManagementStaff: false,
      includeDisbandedTeams: false,
    };

    const result = buildNormalizedSnapshot({
      teams: [
        {
          Name: "Some External Team",
          OverviewPage: "Some External Team",
          Short: "SET",
          Location: "",
          TeamLocation: "",
          Region: "",
          OrganizationPage: "",
          IsDisbanded: "0",
          RenamedTo: "",
        },
      ],
      tenures: [
        {
          PlayerPageName: "rkN (external)",
          PlayerOverviewPage: "rkN (external)",
          PlayerDisplayName: "rkN",
          PlayerId: "rkN",
          PlayerLegalName: "",
          PlayerFullName: "",
          PlayerCountry: "",
          PlayerNationalityPrimary: "",
          PlayerResidency: "",
          PlayerBirthdate: "",
          PlayerIsSubstitute: "0",
          PlayerIsTrainee: "0",
          Roles: "Top",
          RolesIngame: "Top",
          RolesStaff: "",
          RoleModifier: "",
          Status: "Active",
          Team: "Some External Team",
          DateJoin: "",
          DateLeave: "",
          ContractEnd: "",
          IsCurrent: "1",
          RosterChangeIdJoin: "1",
        },
      ],
      fallback: [],
      revisionsByTitle: new Map(),
      policy,
      fictional,
    });

    // Never a bare "rkn" id, and never silently merged into the fictional
    // player's record — it is a fully separate, namespaced, flagged record.
    expect(result.players[0]?.id).not.toBe("rkn");
    expect(result.players[0]?.id.startsWith("external-lol-player-")).toBe(true);
    expect(result.players[0]?.reviewStatus).toBe("needs-review");

    // And the fictional record's own slug is still exactly "noah-rkn-bennett"
    // — this import never touches data/players/*.json.
    const kairosPlayers = loadKairosLeaguePlayers();
    const rkn = kairosPlayers.find((p) => p.nickname === "rkN");
    expect(rkn?.slug).toBe("noah-rkn-bennett");
  });
});
