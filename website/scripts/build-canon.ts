import fs from "node:fs";
import path from "node:path";

import { buildCatalog } from "@/lib/catalog/build";
import { readJson, writeJson } from "@/lib/canon/json";
import { filterScene, loadExternalScene, sceneRoutes } from "@/lib/external/scene";
import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";
import { generatedRoot, websiteRoot } from "@/lib/canon/paths";

fs.mkdirSync(generatedRoot, { recursive: true });
const universe = loadCanonUniverse();
const catalog = buildCatalog(
  universe,
  loadPublicationManifest(),
);
const publication = readJson<{ snapshotId: string; enabledLeagues: string[] }>(path.join(websiteRoot, "kairospedia-external-publication.json"));
const external = loadExternalScene();
const canonIds = new Set(Object.values(universe.collections).flat().map((record) => record.id));
for (const entity of [...external.organizations, ...external.teams, ...external.players, ...external.rosterTenures, ...external.sources]) {
  if (canonIds.has(entity.id)) throw new Error(`External identity collides with canon: ${entity.id}`);
}
if (publication.snapshotId !== external.snapshotId) throw new Error("External publication snapshot mismatch");
catalog.externalScene = filterScene(external, publication.enabledLeagues);
const externalRoutes = sceneRoutes(catalog.externalScene);
if (externalRoutes.some((route) => catalog.routes.includes(route))) throw new Error("External route collides with canon");
catalog.routes.push(...externalRoutes);
writeJson(path.join(generatedRoot, "catalog.json"), catalog);
writeJson(path.join(generatedRoot, "route-manifest.json"), catalog.routes);

console.log(
  `Built Kairospedia catalog: ${catalog.players.length} players, ${catalog.staff.length} staff, ${catalog.routes.length} routes.`,
);
