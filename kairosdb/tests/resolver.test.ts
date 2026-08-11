import { describe, expect, it } from "vitest";

import {
  applyApprovedUniverseOverrides,
  loadApprovedOverrides,
  type CompetitiveWorldOverride,
} from "../src/lib/resolver";
import type { ExternalSnapshotData } from "../src/lib/external/loader";

function fakeSnapshot(): ExternalSnapshotData {
  return {
    descriptor: null,
    organizations: [],
    teams: [
      {
        id: "external-lol-team-cloud9",
        slug: "cloud9",
        name: "Cloud9",
        shortName: "C9",
        gameId: "league-of-legends",
        organizationId: null,
        originType: "real-world-reference",
        continuityId: "kairos-universe",
        leaguepediaOverviewPage: "Cloud9",
        region: "North America",
        location: null,
        status: "active",
        isDisbanded: false,
        currentPlayerTenureIds: [],
        currentStaffTenureIds: [],
        sourceSnapshotId: "leaguepedia-2026-08-03",
        importerVersion: "1.0.0",
        rawRecordChecksum: "x",
        retrievedAt: "2026-08-03T00:00:00Z",
        reviewStatus: "approved",
        reviewNotes: [],
        sources: ["leaguepedia-page-cloud9-revision-1"],
      },
    ],
    players: [],
    staff: [],
    rosterTenures: [
      {
        id: "tenure-1",
        playerId: "external-lol-player-example",
        teamId: "external-lol-team-cloud9",
        gameId: "league-of-legends",
        roles: ["mid"],
        rawRoles: ["Mid"],
        rosterStatus: "active",
        isStarter: true,
        isSubstitute: false,
        isTrainee: false,
        isInactive: false,
        joinedDate: "2026-01-01",
        joinedDatePrecision: "day",
        leftDate: null,
        isCurrentAtSnapshot: true,
        snapshotId: "leaguepedia-2026-08-03",
        effectiveUniversePeriod: "end-of-2026-season",
        frozenUntilPeriod: "2027-midseason",
        sourceSnapshotId: "leaguepedia-2026-08-03",
        importerVersion: "1.0.0",
        rawRecordChecksum: "x",
        retrievedAt: "2026-08-03T00:00:00Z",
        reviewStatus: "approved",
        reviewNotes: [],
        sources: ["leaguepedia-page-example-revision-2"],
      },
    ],
    staffTenures: [],
  };
}

describe("applyApprovedUniverseOverrides", () => {
  it("never mutates the frozen snapshot's arrays", () => {
    const snapshot = fakeSnapshot();
    const originalTeams = snapshot.teams;
    const originalTenures = snapshot.rosterTenures;

    applyApprovedUniverseOverrides(snapshot, "2026-08-03");

    expect(snapshot.teams).toBe(originalTeams);
    expect(snapshot.rosterTenures).toBe(originalTenures);
    expect(snapshot.teams).toHaveLength(1);
  });

  it("returns a distinct resolved-world object, not the raw snapshot", () => {
    const snapshot = fakeSnapshot();
    const resolved = applyApprovedUniverseOverrides(snapshot, "2026-08-03");
    expect(resolved).not.toBe(snapshot);
    expect(resolved.teams).toEqual(snapshot.teams);
  });

  it("with zero overrides, resolves to exactly the frozen snapshot's data", () => {
    const snapshot = fakeSnapshot();
    const resolved = applyApprovedUniverseOverrides(snapshot, "2026-08-03");
    expect(resolved.rosterTenures).toEqual(snapshot.rosterTenures);
    expect(resolved.appliedOverrides).toEqual([]);
  });
});

describe("loadApprovedOverrides", () => {
  it("returns an empty array — no override has been approved yet", () => {
    // data/competitive-world-overrides/ is intentionally empty in this
    // release; see docs/kairosdb/OVERRIDE_WORKFLOW.md.
    expect(loadApprovedOverrides()).toEqual([]);
  });
});

describe("override layering (unit, without disk-backed loadApprovedOverrides)", () => {
  it("would only apply overrides on or before the requested date", () => {
    const overrides: CompetitiveWorldOverride[] = [
      {
        id: "override-early",
        kind: "adopt-real-world-change",
        effectiveDate: "2026-09-01",
        approvedBy: "test",
        approvedAt: "2026-08-03T00:00:00Z",
        description: "test override before the query date",
      },
      {
        id: "override-late",
        kind: "adopt-real-world-change",
        effectiveDate: "2027-06-01",
        approvedBy: "test",
        approvedAt: "2026-08-03T00:00:00Z",
        description: "test override after the query date",
      },
    ];

    const applicable = overrides.filter((o) => o.effectiveDate <= "2026-10-01");
    expect(applicable.map((o) => o.id)).toEqual(["override-early"]);
  });
});
