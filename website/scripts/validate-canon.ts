import path from "node:path";

import { writeJson } from "@/lib/canon/json";
import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";
import { generatedRoot } from "@/lib/canon/paths";
import { validateCanonUniverse } from "@/lib/validation/canon";

const report = validateCanonUniverse(
  loadCanonUniverse(),
  loadPublicationManifest(),
);
writeJson(path.join(generatedRoot, "validation-report.json"), report);

console.log(
  `Canon valid: ${report.entitiesValidated} entities, ${report.referencesChecked} references, ${report.indexesChecked} index entries.`,
);
