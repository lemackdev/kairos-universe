import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  IMPORTER_VERSION,
  SNAPSHOT_CAPTURED_DATE,
  SNAPSHOT_CUTOFF_LOCAL,
  SNAPSHOT_CUTOFF_UTC,
  SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
  SNAPSHOT_ID,
  SNAPSHOT_NEXT_REVIEW_PERIOD,
  SNAPSHOT_SOURCE,
  checksumsJsonPath,
  indexesRoot,
  rawCargoRoot,
  rawMediawikiRoot,
  reportsRoot,
  snapshotJsonPath,
  snapshotRoot,
} from "./config";
import { ensureDir, sha256 } from "./cache";

interface AnyRecord {
  id: string;
  reviewStatus: string;
  sources?: string[];
  isCurrentAtSnapshot?: boolean;
  [key: string]: unknown;
}

function readIndex(name: string): { relPaths: string[]; records: AnyRecord[] } {
  const indexPath = path.join(indexesRoot, `${name}.json`);
  if (!fs.existsSync(indexPath)) return { relPaths: [], records: [] };
  const relPaths = JSON.parse(fs.readFileSync(indexPath, "utf8")) as string[];
  return {
    relPaths,
    records: relPaths.map(
      (rel) =>
        JSON.parse(fs.readFileSync(path.join(snapshotRoot, rel), "utf8")) as AnyRecord,
    ),
  };
}

function run(script: string, args: string[] = []) {
  console.log(`\n=== Running ${script} ${args.join(" ")} ===`);
  // shell:true is required on Windows, where "npx" resolves to "npx.cmd"
  // and execFileSync cannot invoke it directly without a shell.
  execFileSync("npx", ["tsx", `scripts/leaguepedia/${script}`, ...args], {
    stdio: "inherit",
    cwd: process.cwd(),
    shell: true,
  });
}

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const forceOverwrite = args.includes("--force-overwrite-frozen-snapshot");
  const skipImport = args.includes("--skip-import");

  if (fs.existsSync(snapshotJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(snapshotJsonPath, "utf8")) as {
      status?: string;
    };
    if (existing.status === "frozen" && !forceOverwrite) {
      console.error(
        `Snapshot ${SNAPSHOT_ID} is already frozen at ${snapshotJsonPath}. ` +
          "Refusing to overwrite. This snapshot is a permanent historical record. " +
          "If you are certain you need to rebuild it, this requires an explicit destructive flag " +
          "that is intentionally not documented in normal usage instructions.",
      );
      process.exitCode = 1;
      return;
    }
  }

  ensureDir(snapshotRoot);

  if (!skipImport) {
    run("import.ts", ["--resume"]);
  }
  run("normalize.ts");
  run("validate-snapshot.ts");
  run("review-report.ts");

  // --- Approval promotion: validated -> approved, per the section-24
  // criteria. Only records that are already "validated" (passed structural
  // checks) AND carry no needs-review flags may be promoted here. Everything
  // else stays needs-review for manual attention.
  const kinds = [
    "organizations",
    "teams",
    "players",
    "staff",
    "roster-tenures",
    "staff-tenures",
  ] as const;

  let approved = 0;
  let leftNeedsReview = 0;
  for (const kind of kinds) {
    const { records } = readIndex(kind);
    for (const record of records) {
      if (record.reviewStatus === "validated") {
        record.reviewStatus = "approved";
        fs.writeFileSync(
          path.join(snapshotRoot, "normalized", kind, `${record.id}.json`),
          JSON.stringify(record, null, 2),
          "utf8",
        );
        approved += 1;
      } else if (record.reviewStatus === "needs-review") {
        leftNeedsReview += 1;
      }
    }
  }

  // --- Checksums over every raw and normalized file --------------------
  const checksums: Record<string, string> = {};
  for (const file of [
    ...walkFiles(rawCargoRoot),
    ...walkFiles(rawMediawikiRoot),
    ...walkFiles(path.join(snapshotRoot, "normalized")),
  ]) {
    const rel = path.relative(snapshotRoot, file);
    checksums[rel] = sha256(fs.readFileSync(file, "utf8"));
  }
  fs.writeFileSync(checksumsJsonPath, JSON.stringify(checksums, null, 2), "utf8");

  const counts = Object.fromEntries(
    kinds.map((k) => [k, readIndex(k).records.length]),
  );

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  // Freezing requires more than "some record exists" — it requires the
  // primary modern Tenures-based query to have actually succeeded at least
  // once. Without that, any populated records are fallback-only (a small,
  // unrepresentative slice), and marking that "frozen" would misrepresent a
  // partial, blocked import as a completed global snapshot.
  let modernTenureRows = 0;
  const normalizeSummaryPath = path.join(reportsRoot, "NORMALIZE_RUN_SUMMARY.json");
  if (fs.existsSync(normalizeSummaryPath)) {
    const normalizeSummary = JSON.parse(fs.readFileSync(normalizeSummaryPath, "utf8")) as {
      modernTenureRows?: number;
    };
    modernTenureRows = normalizeSummary.modernTenureRows ?? 0;
  }

  const isFullyPopulated = totalRecords > 0 && modernTenureRows > 0;
  const isPartiallyPopulated = totalRecords > 0 && modernTenureRows === 0;

  const status = isFullyPopulated ? "frozen" : isPartiallyPopulated ? "partial" : "empty";

  const notes: string[] = [];
  if (status === "empty") {
    notes.push(
      "This snapshot has zero populated records. It has NOT been frozen. " +
        "This happens when the live Leaguepedia Cargo API was unreachable or rate-limited " +
        "for every query in this run — see reports/IMPORT_RUN_SUMMARY.json for details.",
    );
  } else if (status === "partial") {
    notes.push(
      "This snapshot is NOT frozen and is NOT a complete global sweep. " +
        `The primary current-roster source (the joined Tenures query) never succeeded in this run — ` +
        `0 modern tenure rows were retrieved, even though the Cargo API was reachable for other queries. ` +
        `${totalRecords} record(s) exist, sourced entirely from the ListplayerCurrent fallback table for ` +
        "the small subset of teams that happened to have fallback data cached. Re-run " +
        "leaguepedia:build-snapshot once the Tenures query succeeds before treating this as complete.",
    );
  }

  const snapshot = {
    snapshotId: SNAPSHOT_ID,
    source: SNAPSHOT_SOURCE,
    capturedDate: SNAPSHOT_CAPTURED_DATE,
    cutoffLocal: SNAPSHOT_CUTOFF_LOCAL,
    cutoffUtc: SNAPSHOT_CUTOFF_UTC,
    effectiveUniversePeriod: SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
    status,
    automaticUpdatesEnabled: false,
    nextReviewPeriod: SNAPSHOT_NEXT_REVIEW_PERIOD,
    changesRequireExplicitApproval: true,
    importerVersion: IMPORTER_VERSION,
    builtAt: new Date().toISOString(),
    recordCounts: counts,
    modernTenureRows,
    approvedThisRun: approved,
    needsReview: leftNeedsReview,
    notes,
  };
  fs.writeFileSync(snapshotJsonPath, JSON.stringify(snapshot, null, 2), "utf8");

  ensureDir(reportsRoot);
  console.log("\n=== Snapshot build complete ===");
  console.log(JSON.stringify(snapshot, null, 2));

  if (status !== "frozen") {
    console.error(
      `\nSnapshot status is "${status}", not "frozen". Do not report this snapshot as complete.`,
    );
    process.exitCode = 1;
  }
}

main();
