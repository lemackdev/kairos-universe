import fs from "node:fs";

import {
  SNAPSHOT_ID,
  rawCargoRoot,
  rawMediawikiRoot,
  reportsRoot,
  sourcePagesJsonPath,
} from "./config";
import { ensureDir } from "./cache";
import { fetchPageRevisions, type PageRevisionInfo } from "./mediawiki";
import { ImportManifest, loadCheckpoint, markStepComplete, saveCheckpoint } from "./manifest";
import {
  queryCurrentTenuresGlobal,
  queryListplayerCurrentGlobal,
  queryTeams,
} from "./queries";
import { requestLog } from "./http";

interface ImportSummary {
  snapshotId: string;
  startedAt: string;
  finishedAt: string;
  teamsRowCount: number;
  currentTenuresRowCount: number;
  listplayerCurrentRowCount: number;
  distinctPageTitles: number;
  revisionsResolved: number;
  revisionsMissing: number;
  failedRequests: number;
  errors: string[];
}

async function main() {
  const resume = process.argv.includes("--resume");
  ensureDir(rawCargoRoot);
  ensureDir(rawMediawikiRoot);
  ensureDir(reportsRoot);

  const manifest = ImportManifest.load();
  const checkpoint = loadCheckpoint();
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  console.log(
    `Importing Leaguepedia snapshot ${SNAPSHOT_ID}${resume ? " (resume)" : ""}`,
  );

  let teams: Array<Record<string, string>> = [];
  let tenures: Array<Record<string, string>> = [];
  let fallback: Array<Record<string, string>> = [];

  try {
    console.log("Querying Teams...");
    teams = await queryTeams(manifest);
    markStepComplete(checkpoint, "teams");
  } catch (error) {
    const msg = `Teams query failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    errors.push(msg);
  }

  try {
    console.log("Querying current tenures (global, joined)...");
    tenures = await queryCurrentTenuresGlobal(manifest);
    markStepComplete(checkpoint, "tenures");
  } catch (error) {
    const msg = `Tenures query failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    errors.push(msg);
  }

  try {
    console.log("Querying ListplayerCurrent (fallback source)...");
    fallback = await queryListplayerCurrentGlobal(manifest);
    markStepComplete(checkpoint, "listplayercurrent");
  } catch (error) {
    const msg = `ListplayerCurrent query failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    errors.push(msg);
  }

  const pageTitles = new Set<string>();
  for (const row of teams) {
    if (row.OverviewPage) pageTitles.add(row.OverviewPage);
  }
  for (const row of tenures) {
    if (row.PlayerOverviewPage) pageTitles.add(row.PlayerOverviewPage);
    else if (row.PlayerPageName) pageTitles.add(row.PlayerPageName);
    if (row.Team) pageTitles.add(row.Team);
  }
  for (const row of fallback) {
    if (row.Link) pageTitles.add(row.Link);
    if (row.Team) pageTitles.add(row.Team);
  }

  let revisions: PageRevisionInfo[] = [];
  if (pageTitles.size > 0) {
    try {
      console.log(
        `Resolving page revisions for ${pageTitles.size} distinct pages...`,
      );
      revisions = await fetchPageRevisions(
        Array.from(pageTitles),
        "source-pages",
        manifest,
      );
      markStepComplete(checkpoint, "revisions");
    } catch (error) {
      const msg = `Revision resolution failed: ${error instanceof Error ? error.message : String(error)}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  fs.writeFileSync(
    sourcePagesJsonPath,
    JSON.stringify(
      {
        snapshotId: SNAPSHOT_ID,
        generatedAt: new Date().toISOString(),
        totalPages: revisions.length,
        pages: revisions,
      },
      null,
      2,
    ),
    "utf8",
  );

  manifest.save();
  saveCheckpoint(checkpoint);

  const summary: ImportSummary = {
    snapshotId: SNAPSHOT_ID,
    startedAt,
    finishedAt: new Date().toISOString(),
    teamsRowCount: teams.length,
    currentTenuresRowCount: tenures.length,
    listplayerCurrentRowCount: fallback.length,
    distinctPageTitles: pageTitles.size,
    revisionsResolved: revisions.filter((r) => r.revisionId !== null).length,
    revisionsMissing: revisions.filter((r) => r.revisionId === null).length,
    failedRequests: requestLog.filter((r) => r.status === "failed").length,
    errors,
  };

  fs.writeFileSync(
    `${reportsRoot}/IMPORT_RUN_SUMMARY.json`,
    JSON.stringify(summary, null, 2),
    "utf8",
  );

  console.log("Import step summary:", JSON.stringify(summary, null, 2));

  if (errors.length > 0) {
    console.error(
      `Import completed with ${errors.length} failed queries. Raw data may be incomplete. See reports/IMPORT_RUN_SUMMARY.json.`,
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exitCode = 1;
});
