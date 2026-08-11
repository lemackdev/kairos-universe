import fs from "node:fs";
import path from "node:path";

import { repositoryRoot } from "./config";

/** Loads the slugs/ids already used by fictional Kairos canon records, so
 * the importer can refuse to let an external record collide with one of
 * them instead of silently overwriting or merging. */
export function loadFictionalCanonIdentities(): {
  playerSlugs: Set<string>;
  playerNicknames: Set<string>;
  teamSlugs: Set<string>;
} {
  const playerSlugs = new Set<string>();
  const playerNicknames = new Set<string>();
  const teamSlugs = new Set<string>();

  const playersDir = path.join(repositoryRoot, "data", "players");
  if (fs.existsSync(playersDir)) {
    for (const file of fs.readdirSync(playersDir)) {
      if (!file.endsWith(".json")) continue;
      const record = JSON.parse(
        fs.readFileSync(path.join(playersDir, file), "utf8"),
      ) as { slug?: string; id?: string; nickname?: string };
      if (record.slug) playerSlugs.add(record.slug);
      if (record.id) playerSlugs.add(record.id);
      if (record.nickname) playerNicknames.add(record.nickname.toLowerCase());
    }
  }

  const teamsDir = path.join(repositoryRoot, "data", "teams");
  if (fs.existsSync(teamsDir)) {
    for (const file of fs.readdirSync(teamsDir)) {
      if (!file.endsWith(".json")) continue;
      const record = JSON.parse(
        fs.readFileSync(path.join(teamsDir, file), "utf8"),
      ) as { slug?: string; id?: string };
      if (record.slug) teamSlugs.add(record.slug);
      if (record.id) teamSlugs.add(record.id);
    }
  }

  return { playerSlugs, playerNicknames, teamSlugs };
}
