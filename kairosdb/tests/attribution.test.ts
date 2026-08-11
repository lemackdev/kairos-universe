import { describe, expect, it } from "vitest";

import {
  SNAPSHOT_CAPTURED_DATE,
  SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
  SNAPSHOT_ID,
  SNAPSHOT_NEXT_REVIEW_PERIOD,
} from "../scripts/leaguepedia/config";
import { buildNormalizedSnapshot, type ImportPolicy } from "../scripts/leaguepedia/normalize-core";

const POLICY: ImportPolicy = {
  includeSubstitutes: true,
  includeTrainees: true,
  includeInactiveRosterMembers: true,
  includeCoachingStaff: true,
  includeManagementStaff: false,
  includeDisbandedTeams: false,
};
const NO_FICTIONAL = {
  playerSlugs: new Set<string>(),
  playerNicknames: new Set<string>(),
  teamSlugs: new Set<string>(),
};

describe("snapshot policy constants", () => {
  it("carries the expected frozen-snapshot identity", () => {
    expect(SNAPSHOT_ID).toBe("leaguepedia-2026-08-03");
    expect(SNAPSHOT_CAPTURED_DATE).toBe("2026-08-03");
    expect(SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD).toBe("end-of-2026-season");
  });

  it("the next review period is 2027 midseason", () => {
    expect(SNAPSHOT_NEXT_REVIEW_PERIOD).toBe("2027-midseason");
  });
});

describe("no image fields, no long-form biography text", () => {
  it("normalized player/team/staff records never carry image or biography fields", () => {
    const result = buildNormalizedSnapshot({
      teams: [
        {
          Name: "Cloud9",
          OverviewPage: "Cloud9",
          Short: "C9",
          Location: "",
          TeamLocation: "",
          Region: "North America",
          OrganizationPage: "",
          IsDisbanded: "0",
          RenamedTo: "",
        },
      ],
      tenures: [
        {
          PlayerPageName: "Example",
          PlayerOverviewPage: "Example",
          PlayerDisplayName: "Example",
          PlayerId: "Example",
          PlayerLegalName: "",
          PlayerFullName: "",
          PlayerCountry: "",
          PlayerNationalityPrimary: "",
          PlayerResidency: "",
          PlayerBirthdate: "",
          PlayerIsSubstitute: "0",
          PlayerIsTrainee: "0",
          Roles: "Mid",
          RolesIngame: "Mid",
          RolesStaff: "Head Coach",
          RoleModifier: "",
          Status: "Active",
          Team: "Cloud9",
          DateJoin: "",
          DateLeave: "",
          ContractEnd: "",
          IsCurrent: "1",
          RosterChangeIdJoin: "1",
        },
      ],
      fallback: [],
      revisionsByTitle: new Map(),
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    const forbiddenKeys = ["image", "imageUrl", "photo", "logo", "biography", "bio", "flag"];
    const allRecords = [
      ...result.organizations,
      ...result.teams,
      ...result.players,
      ...result.staff,
    ];
    expect(allRecords.length).toBeGreaterThan(0);
    for (const record of allRecords) {
      const keys = Object.keys(record).map((k) => k.toLowerCase());
      for (const forbidden of forbiddenKeys) {
        expect(keys).not.toContain(forbidden.toLowerCase());
      }
    }
  });
});

describe("every published external entity carries source and snapshot metadata", () => {
  it("attaches sourceSnapshotId and a non-empty sources array", () => {
    const result = buildNormalizedSnapshot({
      teams: [
        {
          Name: "Cloud9",
          OverviewPage: "Cloud9",
          Short: "C9",
          Location: "",
          TeamLocation: "",
          Region: "North America",
          OrganizationPage: "",
          IsDisbanded: "0",
          RenamedTo: "",
        },
      ],
      tenures: [
        {
          PlayerPageName: "Example",
          PlayerOverviewPage: "Example",
          PlayerDisplayName: "Example",
          PlayerId: "Example",
          PlayerLegalName: "",
          PlayerFullName: "",
          PlayerCountry: "",
          PlayerNationalityPrimary: "",
          PlayerResidency: "",
          PlayerBirthdate: "",
          PlayerIsSubstitute: "0",
          PlayerIsTrainee: "0",
          Roles: "Mid",
          RolesIngame: "Mid",
          RolesStaff: "",
          RoleModifier: "",
          Status: "Active",
          Team: "Cloud9",
          DateJoin: "",
          DateLeave: "",
          ContractEnd: "",
          IsCurrent: "1",
          RosterChangeIdJoin: "1",
        },
      ],
      fallback: [],
      revisionsByTitle: new Map(),
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    for (const player of result.players) {
      expect(player.sourceSnapshotId).toBe("leaguepedia-2026-08-03");
      expect(player.sources.length).toBeGreaterThan(0);
    }
    for (const team of result.teams) {
      expect(team.sourceSnapshotId).toBe("leaguepedia-2026-08-03");
      expect(team.sources.length).toBeGreaterThan(0);
    }
  });
});

describe("no invented match results or claimed-complete history", () => {
  it("the roster tenure model has no result/score/win-loss fields", () => {
    const result = buildNormalizedSnapshot({
      teams: [
        {
          Name: "Cloud9",
          OverviewPage: "Cloud9",
          Short: "C9",
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
          PlayerPageName: "Example",
          PlayerOverviewPage: "Example",
          PlayerDisplayName: "Example",
          PlayerId: "Example",
          PlayerLegalName: "",
          PlayerFullName: "",
          PlayerCountry: "",
          PlayerNationalityPrimary: "",
          PlayerResidency: "",
          PlayerBirthdate: "",
          PlayerIsSubstitute: "0",
          PlayerIsTrainee: "0",
          Roles: "Mid",
          RolesIngame: "Mid",
          RolesStaff: "",
          RoleModifier: "",
          Status: "Active",
          Team: "Cloud9",
          DateJoin: "",
          DateLeave: "",
          ContractEnd: "",
          IsCurrent: "1",
          RosterChangeIdJoin: "1",
        },
      ],
      fallback: [],
      revisionsByTitle: new Map(),
      policy: POLICY,
      fictional: NO_FICTIONAL,
    });

    const keys = Object.keys(result.rosterTenures[0] ?? {}).map((k) => k.toLowerCase());
    for (const forbidden of ["result", "score", "wins", "losses", "matchid"]) {
      expect(keys).not.toContain(forbidden);
    }
  });
});
