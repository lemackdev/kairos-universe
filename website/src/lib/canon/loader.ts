import fs from "node:fs";
import path from "node:path";

import type { CanonUniverse, KairosVersion } from "@/types/canon";
import type { PublicationManifest } from "@/types/catalog";

import { readJson } from "./json";
import { publicationPath, repositoryRoot } from "./paths";

export const indexedCollections = [
  "characters",
  "coaches",
  "competitions",
  "continuities",
  "episodes",
  "games",
  "lineups",
  "maps",
  "matches",
  "organizations",
  "players",
  "roster-tenures",
  "seasons",
  "sources",
  "staff-tenures",
  "stages",
  "standings",
  "statistics",
  "teams",
  "tournaments",
  "transfers",
  "awards",
  "uniforms",
  "visual-assets",
] as const;

export function loadCanonUniverse(): CanonUniverse {
  const indexes: CanonUniverse["indexes"] = {};
  const collections: CanonUniverse["collections"] = {};

  for (const collection of indexedCollections) {
    const indexPath = path.join(repositoryRoot, "index", `${collection}.json`);
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Missing index: index/${collection}.json`);
    }

    const entries = readJson<string[]>(indexPath);
    indexes[collection] = entries;
    collections[collection] = entries.map((entry) =>
      readJson<Record<string, unknown>>(path.join(repositoryRoot, entry)),
    );
  }

  const shared: CanonUniverse["shared"] = {};
  const sharedRoot = path.join(repositoryRoot, "data", "shared");
  for (const entry of fs.readdirSync(sharedRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      shared[path.basename(entry.name, ".json")] = readJson<
        Array<Record<string, unknown>>
      >(path.join(sharedRoot, entry.name));
    }
  }

  return {
    version: readJson<KairosVersion>(
      path.join(repositoryRoot, "kairos-version.json"),
    ),
    collections,
    indexes,
    shared,
  };
}

export function loadPublicationManifest(): PublicationManifest {
  return readJson<PublicationManifest>(publicationPath);
}

export function getCollection<T>(
  universe: CanonUniverse,
  collection: string,
): T[] {
  return (universe.collections[collection] ?? []) as T[];
}

export function byId<T extends { id: string }>(records: T[]): Map<string, T> {
  return new Map(records.map((record) => [record.id, record]));
}
