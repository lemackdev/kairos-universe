import path from "node:path";

import type { KairospediaCatalog } from "@/types/catalog";
import { readJson, writeJson } from "@/lib/canon/json";
import { generatedRoot } from "@/lib/canon/paths";
import { buildSearchRecords } from "@/lib/search/build";
import { buildExternalSearch } from "@/lib/external/search";
import { allAddedPlayers } from "@/lib/external/worldState2027";

const catalog = readJson<KairospediaCatalog>(
  path.join(generatedRoot, "catalog.json"),
);
const search = buildSearchRecords(catalog);
if (catalog.externalScene) search.push(...buildExternalSearch(catalog.externalScene));
for (const added of allAddedPlayers(catalog.worldState2027)) {
  search.push({ id: added.playerId, slug: added.slug, type: "player", name: added.nickname,
    subtitle: "League of Legends / 2027 roster", href: `/wiki/players/${added.slug}`,
    terms: [added.nickname, added.playerId, added.slug, added.legalName ?? "", "League of Legends"].filter(Boolean) });
}
const csRosters = catalog.worldState2027?.csExternalRosters;
if (csRosters) {
  for (const org of csRosters.organizations) {
    search.push({ id: org.organizationId, slug: org.slug, type: "organization", name: org.name, subtitle: "Counter-Strike 2 / 2027 organization",
      href: `/wiki/organizations/${org.slug}`, terms: [org.name, org.organizationId, org.slug, "Counter-Strike 2"] });
  }
  for (const team of csRosters.teams) {
    search.push({ id: team.teamId, slug: team.slug, type: "team", name: team.name, subtitle: "Counter-Strike 2 / 2027 roster",
      href: `/wiki/teams/${team.slug}`, terms: [team.name, team.spreadsheetName, team.teamId, team.slug, `HLTV ${team.hltvTeamId}`, "Counter-Strike 2"] });
  }
  for (const player of csRosters.players) {
    search.push({ id: player.playerId, slug: player.slug, type: "player", name: player.nickname, subtitle: "Counter-Strike 2 / 2027 roster",
      href: `/wiki/players/${player.slug}`, terms: [player.nickname, player.playerId, player.slug, player.legalName, "Counter-Strike 2"] });
  }
}
if (new Set(search.map((record) => record.id)).size !== search.length) throw new Error("Duplicate search identity");
writeJson(path.join(generatedRoot, "search-index.json"), search);

console.log(`Built local search index with ${search.length} published entities.`);
