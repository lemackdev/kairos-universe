import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

import { readJson } from "@/lib/canon/json";
import { generatedRoot } from "@/lib/canon/paths";
import type { KairosOriginalPlayer, KairosOriginalTeam } from "@/lib/canon/loader";
import type {
  NormalizedOrganization,
  NormalizedPlayer,
  NormalizedRosterTenure,
  NormalizedStaff,
  NormalizedStaffTenure,
  NormalizedTeam,
  SnapshotDescriptor,
} from "@/types/external";
import type { SearchEntry } from "@/lib/search/search";

export interface KairosDbCatalog {
  generatedAt: string;
  kairos: {
    players: KairosOriginalPlayer[];
    team: KairosOriginalTeam;
  };
  external: {
    snapshotExists: boolean;
    descriptor: SnapshotDescriptor | null;
    organizations: NormalizedOrganization[];
    teams: NormalizedTeam[];
    players: NormalizedPlayer[];
    staff: NormalizedStaff[];
    rosterTenures: NormalizedRosterTenure[];
    staffTenures: NormalizedStaffTenure[];
  };
  counts: Record<string, number>;
}

export const getCatalog = cache((): KairosDbCatalog => {
  const catalogPath = path.join(generatedRoot, "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    throw new Error("KairosDB catalog is missing. Run npm run catalog:build.");
  }
  return readJson<KairosDbCatalog>(catalogPath);
});

export const getSearchIndex = cache((): SearchEntry[] => {
  const searchPath = path.join(generatedRoot, "search-index.json");
  if (!fs.existsSync(searchPath)) {
    throw new Error("KairosDB search index is missing. Run npm run search:build.");
  }
  return readJson<SearchEntry[]>(searchPath);
});
