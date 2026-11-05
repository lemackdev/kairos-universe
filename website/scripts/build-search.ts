import path from "node:path";

import type { KairospediaCatalog } from "@/types/catalog";
import { readJson, writeJson } from "@/lib/canon/json";
import { generatedRoot } from "@/lib/canon/paths";
import { buildSearchRecords } from "@/lib/search/build";
import { buildExternalSearch } from "@/lib/external/search";

const catalog = readJson<KairospediaCatalog>(
  path.join(generatedRoot, "catalog.json"),
);
const search = buildSearchRecords(catalog);
if (catalog.externalScene) search.push(...buildExternalSearch(catalog.externalScene));
for (const added of catalog.worldState2027?.lcsRosters.addedPlayers ?? []) {
  search.push({ id: added.playerId, slug: added.slug, type: "player", name: added.nickname,
    subtitle: "League of Legends / 2027 roster", href: `/wiki/players/${added.slug}`,
    terms: [added.nickname, added.playerId, added.slug, added.legalName, "League of Legends"] });
}
if (new Set(search.map((record) => record.id)).size !== search.length) throw new Error("Duplicate search identity");
writeJson(path.join(generatedRoot, "search-index.json"), search);

console.log(`Built local search index with ${search.length} published entities.`);
