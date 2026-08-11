import fs from "node:fs";
import path from "node:path";

import { indexesRoot, normalizedRoot, reportsRoot, snapshotRoot } from "./config";
import { ensureDir } from "./cache";

interface AnyRecord {
  id: string;
  slug?: string;
  reviewStatus: string;
  sources: string[];
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

function writeRecord(kind: string, record: AnyRecord) {
  fs.writeFileSync(
    path.join(normalizedRoot, kind, `${record.id}.json`),
    JSON.stringify(record, null, 2),
    "utf8",
  );
}

function main() {
  if (!fs.existsSync(snapshotRoot)) {
    console.error(`Snapshot directory does not exist: ${snapshotRoot}. Run leaguepedia:import and leaguepedia:normalize first.`);
    process.exitCode = 1;
    return;
  }

  const organizations = readIndex("organizations");
  const teams = readIndex("teams");
  const players = readIndex("players");
  const staff = readIndex("staff");
  const rosterTenures = readIndex("roster-tenures");
  const staffTenures = readIndex("staff-tenures");

  const errors: string[] = [];
  const idsByKind = new Map<string, Set<string>>([
    ["organizations", new Set()],
    ["teams", new Set()],
    ["players", new Set()],
    ["staff", new Set()],
  ]);
  const slugsByKind = new Map<string, Set<string>>([
    ["teams", new Set()],
    ["players", new Set()],
    ["staff", new Set()],
  ]);

  function checkUnique(kind: string, records: AnyRecord[]) {
    const ids = idsByKind.get(kind)!;
    const slugs = slugsByKind.get(kind);
    for (const record of records) {
      if (ids.has(record.id)) {
        errors.push(`Duplicate stable ID within ${kind}: ${record.id}`);
      }
      ids.add(record.id);
      if (slugs && record.slug) {
        if (slugs.has(record.slug)) {
          errors.push(`Duplicate slug within ${kind}: ${record.slug} (${record.id})`);
        }
        slugs.add(record.slug);
      }
      if (!record.id.startsWith("external-lol-")) {
        errors.push(`Non-namespaced ID found in ${kind}: ${record.id}`);
      }
    }
  }

  checkUnique("organizations", organizations);
  checkUnique("teams", teams);
  checkUnique("players", players);
  checkUnique("staff", staff);

  const teamIds = idsByKind.get("teams")!;
  const orgIds = idsByKind.get("organizations")!;
  const playerIds = idsByKind.get("players")!;
  const staffIds = idsByKind.get("staff")!;

  for (const team of teams) {
    if (team.organizationId && !orgIds.has(team.organizationId as string)) {
      errors.push(`Team ${team.id} references missing organization ${team.organizationId}`);
    }
  }

  for (const rt of rosterTenures) {
    if (!playerIds.has(rt.playerId as string)) {
      errors.push(`Roster tenure ${rt.id} references missing player ${rt.playerId}`);
    }
    if (!teamIds.has(rt.teamId as string)) {
      errors.push(`Roster tenure ${rt.id} references missing team ${rt.teamId}`);
    }
  }

  for (const st of staffTenures) {
    if (!staffIds.has(st.staffId as string)) {
      errors.push(`Staff tenure ${st.id} references missing staff ${st.staffId}`);
    }
    if (!teamIds.has(st.teamId as string)) {
      errors.push(`Staff tenure ${st.id} references missing team ${st.teamId}`);
    }
  }

  const allRecords: Array<{ kind: string; record: AnyRecord }> = [
    ...organizations.map((r) => ({ kind: "organizations", record: r })),
    ...teams.map((r) => ({ kind: "teams", record: r })),
    ...players.map((r) => ({ kind: "players", record: r })),
    ...staff.map((r) => ({ kind: "staff", record: r })),
    ...rosterTenures.map((r) => ({ kind: "roster-tenures", record: r })),
    ...staffTenures.map((r) => ({ kind: "staff-tenures", record: r })),
  ];

  let missingSources = 0;
  let promoted = 0;
  for (const { kind, record } of allRecords) {
    if (!record.sources || record.sources.length === 0 || !record.sources[0]) {
      missingSources += 1;
      if (record.reviewStatus === "imported") {
        record.reviewStatus = "needs-review";
        record.reviewNotes = [
          ...(record.reviewNotes as string[] | undefined ?? []),
          "No source revision reference recorded.",
        ];
        writeRecord(kind, record);
      }
      continue;
    }
    if (record.reviewStatus === "imported") {
      record.reviewStatus = "validated";
      writeRecord(kind, record);
      promoted += 1;
    }
  }

  ensureDir(reportsRoot);
  fs.writeFileSync(
    path.join(reportsRoot, "ROSTER_VALIDATION.md"),
    [
      "# Roster Validation",
      "",
      `Organizations: ${organizations.length}`,
      `Teams: ${teams.length}`,
      `Players: ${players.length}`,
      `Staff: ${staff.length}`,
      `Roster tenures: ${rosterTenures.length}`,
      `Staff tenures: ${staffTenures.length}`,
      `Records promoted imported -> validated: ${promoted}`,
      `Records missing source references: ${missingSources}`,
      "",
      "## Structural errors",
      "",
      errors.length === 0 ? "None." : errors.map((e) => `- ${e}`).join("\n"),
      "",
    ].join("\n"),
    "utf8",
  );

  fs.writeFileSync(
    path.join(reportsRoot, "SOURCE_REVISION_REPORT.md"),
    [
      "# Source Revision Coverage",
      "",
      `Records with a source reference: ${allRecords.length - missingSources} / ${allRecords.length}`,
      `Records missing a source reference: ${missingSources}`,
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(
    `Validation complete: ${errors.length} structural errors, ${promoted} records promoted to validated, ${missingSources} missing source references.`,
  );

  if (errors.length > 0) {
    console.error("Structural validation errors:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
  }
}

main();
