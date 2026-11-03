import fs from "node:fs";
import path from "node:path";

import { buildCatalog } from "@/lib/catalog/build";
import { readJson, writeJson } from "@/lib/canon/json";
import { filterScene, loadExternalScene, sceneRoutes } from "@/lib/external/scene";
import { listAllTier2Teams, loadWorldState2027 } from "@/lib/external/worldState2027";
import { buildPublicationCatalog, publicationRoutes } from "@/lib/publications/build";
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

const worldState2027 = loadWorldState2027();
const knownTeamIds = new Set([...catalog.teams.map((team) => team.id), ...catalog.externalScene.teams.map((team) => team.id)]);
const knownPlayerIds = new Set(catalog.externalScene.players.map((player) => player.id));
for (const region of Object.values(worldState2027.membership.regions)) {
  for (const team of [...region.active, ...region.inactive]) {
    const known = knownTeamIds.has(team.teamId) || (team.parentTeamId !== undefined && knownTeamIds.has(team.parentTeamId));
    if (!known) throw new Error(`2027 regional membership references unknown team: ${team.teamId}`);
  }
}
for (const player of worldState2027.freeAgents.players) {
  if (!knownPlayerIds.has(player.playerId)) throw new Error(`2027 free agent references unknown player: ${player.playerId}`);
}
for (const league of Object.values(worldState2027.tier2Leagues)) {
  for (const team of league.teams) {
    if (team.parentTeamId && !knownTeamIds.has(team.parentTeamId)) throw new Error(`2027 Tier 2 team references unknown parent team: ${team.parentTeamId}`);
  }
}
catalog.worldState2027 = worldState2027;
const tier2Routes = listAllTier2Teams(worldState2027).map((team) => `/wiki/teams/${team.teamId}`);
if (tier2Routes.some((route) => catalog.routes.includes(route))) throw new Error("Tier 2 team route collides with existing route");
catalog.routes.push(...tier2Routes);

const includeDrafts = process.env.KAIROSPEDIA_PREVIEW_DRAFTS === "1";
if (includeDrafts) console.warn("KAIROSPEDIA_PREVIEW_DRAFTS=1: draft publications are included. Never deploy this build.");
catalog.publications = buildPublicationCatalog(universe, catalog, { includeDrafts });
const publicationRouteList = publicationRoutes(catalog.publications);
if (publicationRouteList.some((route) => catalog.routes.includes(route))) throw new Error("Publication route collides with existing route");
catalog.routes.push(...publicationRouteList);
writeJson(path.join(generatedRoot, "catalog.json"), catalog);
writeJson(path.join(generatedRoot, "route-manifest.json"), catalog.routes);

console.log(
  `Built Kairospedia catalog: ${catalog.players.length} players, ${catalog.staff.length} staff, ${catalog.routes.length} routes.`,
);
