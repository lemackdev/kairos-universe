import fs from "node:fs";
import path from "node:path";

import { indexesRoot, reportsRoot, snapshotRoot, SNAPSHOT_ID } from "./config";
import { ensureDir } from "./cache";

interface AnyRecord {
  id: string;
  reviewStatus: string;
  reviewNotes?: string[];
  [key: string]: unknown;
}

function readIndex(name: string): AnyRecord[] {
  const indexPath = path.join(indexesRoot, `${name}.json`);
  if (!fs.existsSync(indexPath)) return [];
  const relPaths = JSON.parse(fs.readFileSync(indexPath, "utf8")) as string[];
  return relPaths.map(
    (rel) =>
      JSON.parse(fs.readFileSync(path.join(snapshotRoot, rel), "utf8")) as AnyRecord,
  );
}

const KINDS = [
  "organizations",
  "teams",
  "players",
  "staff",
  "roster-tenures",
  "staff-tenures",
] as const;

function main() {
  ensureDir(reportsRoot);

  const byKind = new Map(KINDS.map((k) => [k, readIndex(k)]));
  const statusCounts: Record<string, number> = {};
  const needsReview: Array<{ kind: string; id: string; notes: string[] }> = [];

  for (const [kind, records] of byKind) {
    for (const record of records) {
      statusCounts[record.reviewStatus] = (statusCounts[record.reviewStatus] ?? 0) + 1;
      if (record.reviewStatus === "needs-review") {
        needsReview.push({
          kind,
          id: record.id,
          notes: record.reviewNotes ?? [],
        });
      }
    }
  }

  const summaryLines = [
    `# Import Summary — ${SNAPSHOT_ID}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Record counts",
    "",
    ...KINDS.map((k) => `- ${k}: ${byKind.get(k)?.length ?? 0}`),
    "",
    "## Review status",
    "",
    ...Object.entries(statusCounts).map(([status, count]) => `- ${status}: ${count}`),
    "",
  ];
  fs.writeFileSync(
    path.join(reportsRoot, "IMPORT_SUMMARY.md"),
    summaryLines.join("\n"),
    "utf8",
  );

  const warningLines = [
    `# Import Warnings — ${SNAPSHOT_ID}`,
    "",
    `${needsReview.length} record(s) require manual review before they can be approved.`,
    "",
    ...needsReview.map(
      (r) => `- [${r.kind}] ${r.id}: ${r.notes.join(" ") || "(no note recorded)"}`,
    ),
    "",
  ];
  fs.writeFileSync(
    path.join(reportsRoot, "IMPORT_WARNINGS.md"),
    warningLines.join("\n"),
    "utf8",
  );

  console.log(`Review report written. ${needsReview.length} record(s) need review.`);
  console.log(JSON.stringify(statusCounts, null, 2));
}

main();
