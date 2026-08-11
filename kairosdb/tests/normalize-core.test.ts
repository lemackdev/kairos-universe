import { describe, expect, it } from "vitest";

import { buildNormalizedSnapshot, type ImportPolicy } from "../scripts/leaguepedia/normalize-core";
import type { PageRevisionInfo } from "../scripts/leaguepedia/mediawiki";

const POLICY: ImportPolicy = {
  includeSubstitutes: true,
  includeTrainees: true,
  includeInactiveRosterMembers: true,
  includeCoachingStaff: true,
  includeManagementStaff: false,
  includeDisbandedTeams: false,
};

const NO_FICTIONAL = { playerSlugs: new Set<string>(), playerNicknames: new Set<string>(), teamSlugs: new Set<string>() };

function team(overrides: Partial<Record<string, string>> = {}): Record<string, string> {
  return {
    Name: "Cloud9",
    OverviewPage: "Cloud9",
    Short: "C9",
    Location: "",
    TeamLocation: "North America",
    Region: "North America",
    OrganizationPage: "Cloud9 (org)",
    IsDisbanded: "0",
    RenamedTo: "",
    ...overrides,
  };
}

function tenureRow(overrides: Partial<Record<string, string>> = {}): Record<string, string> {
  return {
    PlayerPageName: "Example Player",
    PlayerOverviewPage: "Example Player",
    PlayerDisplayName: "Example",
    PlayerId: "Example",
    PlayerLegalName: "Real Name",
    PlayerFullName: "Real Full Name",
    PlayerCountry: "United States",
    PlayerNationalityPrimary: "American",
    PlayerResidency: "United States",
    PlayerBirthdate: "2000-01-01",
    PlayerIsSubstitute: "0",
    PlayerIsTrainee: "0",
    Roles: "Mid",
    RolesIngame: "Mid",
    RolesStaff: "",
    RoleModifier: "",
    Status: "Active",
    Team: "Cloud9",
    DateJoin: "2026-01-01",
    DateLeave: "",
    ContractEnd: "",
    IsCurrent: "1",
    RosterChangeIdJoin: "1",
    ...overrides,
  };
}

const REVISIONS = new Map<string, PageRevisionInfo>([
  [
    "Cloud9",
    {
      requestedTitle: "Cloud9",
      resolvedTitle: "Cloud9",
      pageId: 1,
      namespace: 0,
      redirectTarget: null,
      missing: false,
      revisionId: 111,
      revisionTimestamp: "2026-08-01T00:00:00Z",
      retrievedAt: "2026-08-03T00:00:00Z",
    },
  ],
  [
    "Example Player",
    {
      requestedTitle: "Example Player",
      resolvedTitle: "Example Player",
      pageId: 2,
      namespace: 0,
      redirectTarget: null,
      missing: false,
      revisionId: 222,
      revisionTimestamp: "2026-08-01T00:00:00Z",
      retrievedAt: "2026-08-03T00:00:00Z",
    },
  ],
]);

describe("buildNormalizedSnapshot — team and organization normalization", () => {
  it("normalizes a team and its organization separately", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow()],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.teams).toHaveLength(1);
    expect(result.teams[0]?.id).toBe("external-lol-team-cloud9");
    expect(result.teams[0]?.organizationId).toBe("external-lol-org-cloud9-org");
    expect(result.organizations).toHaveLength(1);
    expect(result.organizations[0]?.teamIds).toContain("external-lol-team-cloud9");
  });

  it("leaves organizationId null when Leaguepedia provides no OrganizationPage", () => {
    const result = buildNormalizedSnapshot({
      teams: [team({ OrganizationPage: "" })],
      tenures: [tenureRow()],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.teams[0]?.organizationId).toBeNull();
    expect(result.organizations).toHaveLength(0);
  });

  it("excludes disbanded teams by default even with current-looking tenure rows", () => {
    const result = buildNormalizedSnapshot({
      teams: [team({ IsDisbanded: "1" })],
      tenures: [tenureRow()],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.teams).toHaveLength(0);
    expect(result.players).toHaveLength(0);
  });
});

describe("buildNormalizedSnapshot — player normalization and role mapping", () => {
  it("maps ADC to bot and preserves raw role text", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ RolesIngame: "ADC" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.players[0]?.primaryRole).toBe("bot");
    expect(result.rosterTenures[0]?.roles).toEqual(["bot"]);
    expect(result.rosterTenures[0]?.rawRoles).toEqual(["ADC"]);
  });

  it("keeps an unrecognized role as unknown instead of guessing", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ RolesIngame: "Flex" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.players[0]?.primaryRole).toBe("unknown");
  });

  it("marks substitutes and trainees, and starters as neither", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ PlayerIsSubstitute: "1" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.rosterTenures[0]?.isSubstitute).toBe(true);
    expect(result.rosterTenures[0]?.isStarter).toBe(false);
  });

  it("attaches a source reference carrying the resolved revision", () => {
    const result = buildNormalizedSnapshot({
      teams: [team({ OrganizationPage: "" })], // no org page -> no extra revision lookup needed
      tenures: [tenureRow()],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.players[0]?.sources[0]).toContain("revision-222");
    expect(result.report.missingFields).toHaveLength(0);
  });

  it("records a missing-field note when no revision was resolved", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow()],
      fallback: [],
      revisionsByTitle: new Map(), // no revisions resolved at all
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.report.missingFields.length).toBeGreaterThan(0);
    expect(result.players[0]?.sources[0]).toContain("revision-unknown");
  });
});

describe("buildNormalizedSnapshot — staff and player/staff linking", () => {
  it("creates both a player and a linked staff record for one person with both role kinds", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ RolesIngame: "Mid", RolesStaff: "Assistant Coach" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.players).toHaveLength(1);
    expect(result.staff).toHaveLength(1);
    expect(result.staff[0]?.linkedPlayerId).toBe(result.players[0]?.id);
    expect(result.staffTenures[0]?.role).toBe("Assistant Coach");
  });

  it("excludes management-only staff roles unless the policy opts in", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ RolesIngame: "", RolesStaff: "Owner" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.staff).toHaveLength(0);
  });
});

describe("buildNormalizedSnapshot — fictional/external separation", () => {
  it("flags a nickname collision with a fictional Kairos player as needs-review instead of merging", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ PlayerDisplayName: "rkN" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: { ...NO_FICTIONAL, playerNicknames: new Set(["rkn"]) },
    });

    expect(result.players[0]?.reviewStatus).toBe("needs-review");
    expect(result.players[0]?.id).toContain("external-lol-player-");
    expect(result.report.ambiguous.length).toBeGreaterThan(0);
  });

  it("still namespaces the external player id even on collision (never a bare id)", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ PlayerDisplayName: "rkN" })],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: { ...NO_FICTIONAL, playerNicknames: new Set(["rkn"]) },
    });

    expect(result.players[0]?.id.startsWith("external-lol-player-")).toBe(true);
  });
});

describe("buildNormalizedSnapshot — duplicate / contradictory tenures", () => {
  it("flags a person with current tenures on two different teams", () => {
    const result = buildNormalizedSnapshot({
      teams: [team(), team({ Name: "TSM", OverviewPage: "TSM", Short: "TSM", OrganizationPage: "TSM (org)" })],
      tenures: [
        tenureRow({ Team: "Cloud9" }),
        tenureRow({ Team: "TSM" }),
      ],
      fallback: [],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.report.duplicates.length).toBeGreaterThan(0);
    expect(result.rosterTenures.every((t) => t.reviewStatus === "needs-review")).toBe(true);
  });
});

describe("buildNormalizedSnapshot — ListplayerCurrent fallback", () => {
  it("uses fallback rows only for teams with no modern tenure rows", () => {
    const teams = [
      team(),
      team({ Name: "100 Thieves", OverviewPage: "100 Thieves", Short: "100T", OrganizationPage: "100 Thieves (org)" }),
    ];
    const result = buildNormalizedSnapshot({
      teams,
      tenures: [tenureRow({ Team: "Cloud9" })], // modern data only for Cloud9
      fallback: [
        {
          ID: "FallbackPlayer",
          Link: "Fallback Player",
          Name: "Fallback Player",
          N: "1",
          Country: "Canada",
          Role: "Top",
          IsSubstitute: "",
          IsTrainee: "",
          Team: "100 Thieves",
          ContractDate: "2026-02-01",
          Residency: "Canada",
        },
      ],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    const fallbackPlayer = result.players.find((p) => p.leaguepediaPage === "Fallback Player");
    expect(fallbackPlayer).toBeDefined();
    expect(fallbackPlayer?.reviewStatus).toBe("needs-review");
    expect(fallbackPlayer?.primaryRole).toBe("top");

    // Cloud9 has modern data — a fallback row for Cloud9 must never appear
    // even if present in the raw fallback rows (modern data wins).
    expect(result.players.some((p) => p.currentTeamId === "external-lol-team-cloud9" && p.reviewStatus === "needs-review")).toBe(false);
  });

  it("does not blindly merge modern and fallback rows for the same team", () => {
    const result = buildNormalizedSnapshot({
      teams: [team()],
      tenures: [tenureRow({ Team: "Cloud9" })],
      fallback: [
        {
          ID: "ShouldBeIgnored",
          Link: "Should Be Ignored",
          Name: "Should Be Ignored",
          N: "1",
          Country: "Canada",
          Role: "Top",
          IsSubstitute: "",
          IsTrainee: "",
          Team: "Cloud9",
          ContractDate: "2026-02-01",
          Residency: "Canada",
        },
      ],
      revisionsByTitle: REVISIONS,
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    expect(result.players.some((p) => p.nickname === "Should Be Ignored")).toBe(false);
  });
});
