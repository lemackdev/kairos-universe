import fs from "node:fs";
import path from "node:path";

import { generatedRoot } from "../src/lib/canon/paths";

const REQUIRED_KAIROS_PLAYER_SLUGS = [
  "noah-rkn-bennett",
  "ethan-vanta-walker",
  "mason-404-brooks",
  "liam-aster-oconnor",
  "daniel-moss-reyes",
];

interface Catalog {
  kairos: { players: Array<{ slug: string }>; team: { slug: string } };
  external: {
    snapshotExists: boolean;
    players: Array<{ id: string; slug: string; sources: string[] }>;
    teams: Array<{ id: string; slug: string; sources: string[] }>;
  };
}

function main() {
  const catalogPath = path.join(generatedRoot, "catalog.json");
  if (!fs.existsSync(catalogPath)) {
    console.error("catalog.json missing. Run catalog:build first.");
    process.exitCode = 1;
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Catalog;
  const errors: string[] = [];

  const presentSlugs = new Set(catalog.kairos.players.map((p) => p.slug));
  for (const required of REQUIRED_KAIROS_PLAYER_SLUGS) {
    if (!presentSlugs.has(required)) {
      errors.push(`Required Kairos player missing from catalog: ${required}`);
    }
  }

  if (catalog.kairos.team.slug !== "kairos-lol-main") {
    errors.push(
      `Kairos League team slug unexpected: ${catalog.kairos.team.slug}`,
    );
  }

  for (const player of catalog.external.players) {
    if (!player.id.startsWith("external-lol-player-")) {
      errors.push(`External player id not namespaced: ${player.id}`);
    }
    if (!player.sources || player.sources.length === 0) {
      errors.push(`External player missing source reference: ${player.id}`);
    }
  }
  for (const team of catalog.external.teams) {
    if (!team.id.startsWith("external-lol-team-")) {
      errors.push(`External team id not namespaced: ${team.id}`);
    }
  }

  if (!catalog.external.snapshotExists) {
    console.warn(
      "WARNING: no frozen external snapshot is populated yet. " +
        "KairosDB will build and publish successfully with zero external records, " +
        "but external team/player/staff pages will be empty until the snapshot is imported.",
    );
  }

  if (errors.length > 0) {
    console.error("Catalog validation failed:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  console.log("Catalog validation passed.");
}

main();
