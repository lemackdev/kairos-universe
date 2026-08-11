import fs from "node:fs";
import path from "node:path";

import { readJsonIfExists } from "@/lib/canon/json";
import { externalDataRoot } from "@/lib/canon/paths";
import type {
  NormalizedOrganization,
  NormalizedPlayer,
  NormalizedRosterTenure,
  NormalizedStaff,
  NormalizedStaffTenure,
  NormalizedTeam,
  SnapshotDescriptor,
} from "@/types/external";

export const SNAPSHOT_ID = "leaguepedia-2026-08-03";

const snapshotRoot = path.join(externalDataRoot, "snapshots", SNAPSHOT_ID);
const indexesRoot = path.join(snapshotRoot, "indexes");

function readIndexed<T>(indexName: string): T[] {
  const indexPath = path.join(indexesRoot, `${indexName}.json`);
  const relPaths = readJsonIfExists<string[]>(indexPath) ?? [];
  return relPaths
    .map((rel) => readJsonIfExists<T>(path.join(snapshotRoot, rel)))
    .filter((record): record is T => record !== null);
}

export interface ExternalSnapshotData {
  descriptor: SnapshotDescriptor | null;
  organizations: NormalizedOrganization[];
  teams: NormalizedTeam[];
  players: NormalizedPlayer[];
  staff: NormalizedStaff[];
  rosterTenures: NormalizedRosterTenure[];
  staffTenures: NormalizedStaffTenure[];
}

let cached: ExternalSnapshotData | null = null;

/** Loads the frozen external snapshot from disk. Cached per server process
 * since the snapshot is immutable once frozen — there is nothing to
 * invalidate the cache for within a running server. */
export function loadExternalSnapshot(): ExternalSnapshotData {
  if (cached) return cached;

  cached = {
    descriptor: readJsonIfExists<SnapshotDescriptor>(
      path.join(snapshotRoot, "snapshot.json"),
    ),
    organizations: readIndexed<NormalizedOrganization>("organizations"),
    teams: readIndexed<NormalizedTeam>("teams"),
    players: readIndexed<NormalizedPlayer>("players"),
    staff: readIndexed<NormalizedStaff>("staff"),
    rosterTenures: readIndexed<NormalizedRosterTenure>("roster-tenures"),
    staffTenures: readIndexed<NormalizedStaffTenure>("staff-tenures"),
  };
  return cached;
}

export function snapshotExists(): boolean {
  return fs.existsSync(path.join(snapshotRoot, "snapshot.json"));
}

export function byId<T extends { id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((r) => [r.id, r]));
}

export function bySlug<T extends { slug: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((r) => [r.slug, r]));
}
