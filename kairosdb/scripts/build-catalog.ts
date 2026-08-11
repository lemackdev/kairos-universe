import fs from "node:fs";
import path from "node:path";

import { loadKairosLeaguePlayers, loadKairosLeagueTeam } from "../src/lib/canon/loader";
import { generatedRoot } from "../src/lib/canon/paths";
import { loadExternalSnapshot, snapshotExists } from "../src/lib/external/loader";

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(generatedRoot);

  const kairosPlayers = loadKairosLeaguePlayers();
  const kairosTeam = loadKairosLeagueTeam();
  const hasSnapshot = snapshotExists();
  const external = hasSnapshot
    ? loadExternalSnapshot()
    : {
        descriptor: null,
        organizations: [],
        teams: [],
        players: [],
        staff: [],
        rosterTenures: [],
        staffTenures: [],
      };

  const errors: string[] = [];

  const kairosPlayerSlugs = new Set(kairosPlayers.map((p) => p.slug));
  const kairosTeamSlugs = new Set([kairosTeam.slug]);

  for (const player of external.players) {
    if (!player.id.startsWith("external-lol-player-")) {
      errors.push(`External player id is not namespaced: ${player.id}`);
    }
    if (kairosPlayerSlugs.has(player.slug)) {
      errors.push(
        `External player slug "${player.slug}" (${player.id}) collides with a Kairos original player. This must never happen — the importer's collision guard failed.`,
      );
    }
  }
  for (const team of external.teams) {
    if (!team.id.startsWith("external-lol-team-")) {
      errors.push(`External team id is not namespaced: ${team.id}`);
    }
    if (kairosTeamSlugs.has(team.slug)) {
      errors.push(
        `External team slug "${team.slug}" (${team.id}) collides with the Kairos team.`,
      );
    }
  }

  if (errors.length > 0) {
    console.error("Catalog build found fictional/external collisions:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    kairos: {
      players: kairosPlayers,
      team: kairosTeam,
    },
    external: {
      snapshotExists: hasSnapshot,
      descriptor: external.descriptor,
      organizations: external.organizations,
      teams: external.teams,
      players: external.players,
      staff: external.staff,
      rosterTenures: external.rosterTenures,
      staffTenures: external.staffTenures,
    },
    counts: {
      kairosPlayers: kairosPlayers.length,
      externalOrganizations: external.organizations.length,
      externalTeams: external.teams.length,
      externalPlayers: external.players.length,
      externalStaff: external.staff.length,
    },
  };

  fs.writeFileSync(
    path.join(generatedRoot, "catalog.json"),
    JSON.stringify(catalog, null, 2),
    "utf8",
  );

  console.log(
    `Built KairosDB catalog: ${kairosPlayers.length} Kairos players, ${external.teams.length} external teams, ${external.players.length} external players, ${external.staff.length} external staff.${hasSnapshot ? "" : " (No frozen snapshot populated yet.)"}`,
  );
}

main();
