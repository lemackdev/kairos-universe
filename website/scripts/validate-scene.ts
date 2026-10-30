import { loadExternalScene } from "@/lib/external/scene";
const scene = loadExternalScene();
console.log(`External reference snapshot valid: ${scene.teams.length} teams, ${scene.players.length} unique players, ${scene.rosterTenures.length} event roster observations. Review status remains needs-review.`);
