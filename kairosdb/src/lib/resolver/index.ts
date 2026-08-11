import fs from "node:fs";
import path from "node:path";

import { readJson } from "@/lib/canon/json";
import { overridesRoot } from "@/lib/canon/paths";
import { loadExternalSnapshot, type ExternalSnapshotData } from "@/lib/external/loader";
import type { NormalizedRosterTenure, NormalizedTeam } from "@/types/external";

/**
 * The competitive-world resolver. Two layers, resolved in order:
 *
 *   1. The frozen external Leaguepedia snapshot (never mutated).
 *   2. Approved Kairos Universe overrides layered on top for a given date.
 *
 * No override records exist yet — `data/competitive-world-overrides/` is
 * empty by design for this release. This module still reads that directory
 * (an empty read, today) so the layering behavior is real and testable
 * before the first override is ever approved, rather than being bolted on
 * later as a breaking change.
 */

export type OverrideKind =
  | "player-leaves-external-team"
  | "external-player-joins-kairos"
  | "kairos-player-joins-external-team"
  | "external-team-signs-fictional-player"
  | "adopt-real-world-change"
  | "reject-real-world-change"
  | "kairos-exclusive-retirement";

export interface CompetitiveWorldOverride {
  id: string;
  kind: OverrideKind;
  effectiveDate: string;
  approvedBy: string;
  approvedAt: string;
  description: string;
  playerId?: string;
  teamId?: string;
}

export function getExternalSnapshot(snapshotId: string): ExternalSnapshotData {
  if (snapshotId !== "leaguepedia-2026-08-03") {
    throw new Error(`Unknown external snapshot: ${snapshotId}`);
  }
  return loadExternalSnapshot();
}

export function getExternalTeamRoster(
  teamId: string,
  snapshotId: string,
): NormalizedRosterTenure[] {
  const snapshot = getExternalSnapshot(snapshotId);
  return snapshot.rosterTenures.filter((t) => t.teamId === teamId);
}

export function getExternalPlayerCareer(
  playerId: string,
  snapshotId: string,
): NormalizedRosterTenure[] {
  const snapshot = getExternalSnapshot(snapshotId);
  return snapshot.rosterTenures.filter((t) => t.playerId === playerId);
}

let overridesCache: CompetitiveWorldOverride[] | null = null;

/** Loads every approved override file from
 * data/competitive-world-overrides/. Returns an empty array today — no
 * override has been approved yet. */
export function loadApprovedOverrides(): CompetitiveWorldOverride[] {
  if (overridesCache) return overridesCache;
  if (!fs.existsSync(overridesRoot)) {
    overridesCache = [];
    return overridesCache;
  }
  const files = fs
    .readdirSync(overridesRoot)
    .filter((f) => f.endsWith(".json"));
  overridesCache = files.map((f) =>
    readJson<CompetitiveWorldOverride>(path.join(overridesRoot, f)),
  );
  return overridesCache;
}

export interface ResolvedWorld {
  snapshotId: string;
  asOfDate: string;
  teams: NormalizedTeam[];
  rosterTenures: NormalizedRosterTenure[];
  appliedOverrides: CompetitiveWorldOverride[];
}

/** Applies every override whose effectiveDate is on or before `date` on top
 * of the frozen snapshot. Never mutates the snapshot data itself — builds a
 * new resolved view instead. With zero overrides (the current state), this
 * is the identity function over the frozen snapshot. */
export function applyApprovedUniverseOverrides(
  snapshot: ExternalSnapshotData,
  date: string,
): ResolvedWorld {
  const overrides = loadApprovedOverrides().filter((o) => o.effectiveDate <= date);

  // No override kinds are implemented yet because none exist to apply.
  // This function still returns a distinct resolved-world object (not the
  // raw snapshot) so callers never depend on override application being a
  // no-op.
  return {
    snapshotId: "leaguepedia-2026-08-03",
    asOfDate: date,
    teams: snapshot.teams,
    rosterTenures: snapshot.rosterTenures,
    appliedOverrides: overrides,
  };
}

export function getCompetitiveWorldAtDate(date: string): ResolvedWorld {
  const snapshot = getExternalSnapshot("leaguepedia-2026-08-03");
  return applyApprovedUniverseOverrides(snapshot, date);
}

export function getResolvedPlayerTeam(
  playerId: string,
  date: string,
): string | null {
  const world = getCompetitiveWorldAtDate(date);
  const tenure = world.rosterTenures.find(
    (t) => t.playerId === playerId && t.isCurrentAtSnapshot,
  );
  return tenure?.teamId ?? null;
}

export function getResolvedTeamRoster(
  teamId: string,
  date: string,
): NormalizedRosterTenure[] {
  const world = getCompetitiveWorldAtDate(date);
  return world.rosterTenures.filter((t) => t.teamId === teamId);
}
