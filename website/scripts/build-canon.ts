import fs from "node:fs";
import path from "node:path";

import { buildCatalog } from "@/lib/catalog/build";
import { writeJson } from "@/lib/canon/json";
import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";
import { generatedRoot } from "@/lib/canon/paths";

fs.mkdirSync(generatedRoot, { recursive: true });
const catalog = buildCatalog(
  loadCanonUniverse(),
  loadPublicationManifest(),
);
writeJson(path.join(generatedRoot, "catalog.json"), catalog);
writeJson(path.join(generatedRoot, "route-manifest.json"), catalog.routes);

console.log(
  `Built Kairospedia catalog: ${catalog.players.length} players, ${catalog.staff.length} staff, ${catalog.routes.length} routes.`,
);
