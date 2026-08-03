import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

import type {
  KairospediaCatalog,
  SearchRecord,
} from "@/types/catalog";
import { readJson } from "@/lib/canon/json";
import { generatedRoot } from "@/lib/canon/paths";

export const getCatalog = cache((): KairospediaCatalog => {
  const catalogPath = path.join(generatedRoot, "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    throw new Error("Kairospedia catalog is missing. Run npm run canon:build.");
  }
  return readJson<KairospediaCatalog>(catalogPath);
});

export const getSearchIndex = cache((): SearchRecord[] => {
  const searchPath = path.join(generatedRoot, "search-index.json");
  if (!fs.existsSync(searchPath)) {
    throw new Error("Kairospedia search index is missing. Run npm run search:build.");
  }
  return readJson<SearchRecord[]>(searchPath);
});
