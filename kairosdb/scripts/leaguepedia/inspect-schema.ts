import fs from "node:fs";
import path from "node:path";

import { reportsRoot } from "./config";
import { ensureDir } from "./cache";
import { fetchLeaguepediaJson } from "./http";
import { ImportManifest } from "./manifest";

const TABLES_OF_INTEREST = [
  "Players",
  "Teams",
  "Tenures",
  "RosterChanges",
  "PlayerRedirects",
  "Alphabets",
  "ListplayerCurrent",
];

interface CargoFieldsResponse {
  cargofields?: Record<string, { type: string; isList?: string; delimiter?: string }>;
}

/**
 * `npm run leaguepedia:schema`
 *
 * Queries the live Cargo API (action=cargofields) for each table this
 * importer depends on and writes a report of the fields actually available
 * right now, so the import scripts can be checked against reality instead of
 * assuming the spec's field list is still current.
 */
async function main() {
  const manifest = ImportManifest.load();
  const report: Record<string, { field: string; type: string }[] | { error: string }> = {};

  for (const table of TABLES_OF_INTEREST) {
    try {
      const body = await fetchLeaguepediaJson<CargoFieldsResponse>({
        action: "cargofields",
        table,
      });
      const fields = Object.entries(body.cargofields ?? {}).map(
        ([field, info]) => ({ field, type: info.type }),
      );
      report[table] = fields;
      manifest.record({
        kind: "cargo",
        description: `schema inspection: cargofields for ${table}`,
        requestUrl: `https://lol.fandom.com/api.php?action=cargofields&table=${table}&format=json`,
        rawFile: "(schema report only, not cached per-row)",
        rowCount: fields.length,
        checksum: "",
        issuedAt: new Date().toISOString(),
      });
    } catch (error) {
      report[table] = {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  ensureDir(reportsRoot);
  const outPath = path.join(reportsRoot, "CARGO_SCHEMA_INSPECTION.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  manifest.save();

  console.log(`Schema inspection written to ${outPath}`);
  for (const [table, fields] of Object.entries(report)) {
    if (Array.isArray(fields)) {
      console.log(`  ${table}: ${fields.length} fields`);
    } else {
      console.log(`  ${table}: ERROR ${fields.error}`);
    }
  }
}

main().catch((error) => {
  console.error("Schema inspection failed:", error);
  process.exitCode = 1;
});
