import fs from "node:fs";
import path from "node:path";

import {
  importPolicyPath,
  indexesRoot,
  normalizedRoot,
  reportsRoot,
  sourcePagesJsonPath,
} from "./config";
import { ensureDir } from "./cache";
import { ImportManifest } from "./manifest";
import {
  queryCurrentTenuresGlobal,
  queryListplayerCurrentGlobal,
  queryTeams,
} from "./queries";
import { loadFictionalCanonIdentities } from "./collisions";
import { buildNormalizedSnapshot, type ImportPolicy } from "./normalize-core";
import type { PageRevisionInfo } from "./mediawiki";

async function main() {
  ensureDir(normalizedRoot);
  ensureDir(path.join(normalizedRoot, "organizations"));
  ensureDir(path.join(normalizedRoot, "teams"));
  ensureDir(path.join(normalizedRoot, "players"));
  ensureDir(path.join(normalizedRoot, "staff"));
  ensureDir(path.join(normalizedRoot, "roster-tenures"));
  ensureDir(path.join(normalizedRoot, "staff-tenures"));
  ensureDir(path.join(normalizedRoot, "aliases"));
  ensureDir(indexesRoot);
  ensureDir(reportsRoot);

  const policy = JSON.parse(fs.readFileSync(importPolicyPath, "utf8")) as ImportPolicy;
  const manifest = ImportManifest.load();

  // Each query is independent: a failure in one (e.g. the Tenures query
  // still being rate-limited) must not discard raw data already cached for
  // the others. Normalize whatever succeeded; the resulting snapshot status
  // ("frozen" vs "partial") reflects exactly what's missing.
  const queryErrors: string[] = [];
  async function tryQuery(
    label: string,
    fn: () => Promise<Array<Record<string, string>>>,
  ): Promise<Array<Record<string, string>>> {
    try {
      return await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`${label} query failed during normalize: ${message}`);
      queryErrors.push(`${label}: ${message}`);
      return [];
    }
  }

  const teams = await tryQuery("Teams", () => queryTeams(manifest));
  const tenures = await tryQuery("Tenures", () => queryCurrentTenuresGlobal(manifest));
  const fallback = await tryQuery("ListplayerCurrent", () => queryListplayerCurrentGlobal(manifest));
  manifest.save();

  let revisionsByTitle = new Map<string, PageRevisionInfo>();
  if (fs.existsSync(sourcePagesJsonPath)) {
    const sourcePages = JSON.parse(fs.readFileSync(sourcePagesJsonPath, "utf8")) as {
      pages: PageRevisionInfo[];
    };
    revisionsByTitle = new Map(sourcePages.pages.map((p) => [p.requestedTitle, p]));
  }

  const fictional = loadFictionalCanonIdentities();

  const result = buildNormalizedSnapshot({
    teams,
    tenures,
    fallback,
    revisionsByTitle,
    policy,
    fictional,
  });

  function writeRecord(dir: string, id: string, record: unknown) {
    fs.writeFileSync(
      path.join(normalizedRoot, dir, `${id}.json`),
      JSON.stringify(record, null, 2),
      "utf8",
    );
  }
  function writeIndex(name: string, ids: string[], dir: string) {
    fs.writeFileSync(
      path.join(indexesRoot, `${name}.json`),
      JSON.stringify(ids.sort().map((id) => `normalized/${dir}/${id}.json`), null, 2),
      "utf8",
    );
  }

  for (const org of result.organizations) writeRecord("organizations", org.id, org);
  for (const team of result.teams) writeRecord("teams", team.id, team);
  for (const player of result.players) writeRecord("players", player.id, player);
  for (const staff of result.staff) writeRecord("staff", staff.id, staff);
  for (const rt of result.rosterTenures) writeRecord("roster-tenures", rt.id, rt);
  for (const st of result.staffTenures) writeRecord("staff-tenures", st.id, st);
  for (const alias of result.aliases) writeRecord("aliases", alias.id, alias);

  writeIndex("organizations", result.organizations.map((o) => o.id), "organizations");
  writeIndex("teams", result.teams.map((t) => t.id), "teams");
  writeIndex("players", result.players.map((p) => p.id), "players");
  writeIndex("staff", result.staff.map((s) => s.id), "staff");
  writeIndex("roster-tenures", result.rosterTenures.map((r) => r.id), "roster-tenures");
  writeIndex("staff-tenures", result.staffTenures.map((r) => r.id), "staff-tenures");

  const { report } = result;
  fs.writeFileSync(
    path.join(reportsRoot, "AMBIGUOUS_RECORDS.md"),
    `# Ambiguous Records\n\n${report.ambiguous.length === 0 ? "None.\n" : report.ambiguous.map((l) => `- ${l}`).join("\n") + "\n"}`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(reportsRoot, "DUPLICATE_CANDIDATES.md"),
    `# Duplicate Candidates\n\n${report.duplicates.length === 0 ? "None.\n" : report.duplicates.map((l) => `- ${l}`).join("\n") + "\n"}`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(reportsRoot, "MISSING_FIELDS.md"),
    `# Missing Fields\n\n${report.missingFields.length === 0 ? "None.\n" : report.missingFields.map((l) => `- ${l}`).join("\n") + "\n"}`,
    "utf8",
  );

  const summary = {
    snapshotId: "leaguepedia-2026-08-03",
    generatedAt: new Date().toISOString(),
    organizations: result.organizations.length,
    teams: result.teams.length,
    players: result.players.length,
    staff: result.staff.length,
    rosterTenures: result.rosterTenures.length,
    staffTenures: result.staffTenures.length,
    modernTenureRows: tenures.length,
    fallbackRows: fallback.length,
    queryErrors,
    ambiguousCount: report.ambiguous.length,
    duplicateCount: report.duplicates.length,
    missingFieldsCount: report.missingFields.length,
    warnings: report.warnings,
  };
  fs.writeFileSync(
    path.join(reportsRoot, "NORMALIZE_RUN_SUMMARY.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );

  console.log("Normalization summary:", JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error("Normalize failed:", error);
  process.exitCode = 1;
});
