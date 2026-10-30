import fs from "node:fs";
import path from "node:path";
import { normalizeScene, readSceneResearch, sceneRoot } from "@/lib/external/scene";

const scene = normalizeScene(readSceneResearch());
const outputs: Array<[string, string]> = [];
for (const kind of ["organizations", "teams", "players", "rosterTenures", "sources"] as const) {
  const folder = kind === "rosterTenures" ? "roster-tenures" : kind;
  const entries = scene[kind].map((record) => {
    const relative = `records/${folder}/${record.id}.json`;
    outputs.push([relative, JSON.stringify(record, null, 2) + "\n"]);
    return relative;
  });
  outputs.push([`index/${folder}.json`, JSON.stringify(entries, null, 2) + "\n"]);
}
// Preflight the entire write set before creating anything. Existing evidence is never overwritten.
for (const [relative, content] of outputs) {
  const file = path.join(sceneRoot, relative);
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") !== content) throw new Error(`Refusing to overwrite ${relative}. Create a reviewed new snapshot instead.`);
}
let created = 0;
for (const [relative, content] of outputs) {
  const file = path.join(sceneRoot, relative);
  if (fs.existsSync(file)) continue;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, { flag: "wx" });
  created++;
}
console.log(`Created ${created} snapshot records/indexes: ${scene.teams.length} teams, ${scene.players.length} people, ${scene.rosterTenures.length} roster observations.`);
