import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { PlayerPortraitAsset } from "../shared/branding";
import { filterBranding, loadBranding, safeAssetPath } from "../shared/branding";

const appRoot = process.cwd();
const root = path.resolve(appRoot, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "website/kairospedia-publication.json"), "utf8"));
const full = loadBranding(root);
const catalog = filterBranding(full, manifest.enabledTeams);
const destination = path.join(appRoot, "public/branding");
const marker = path.join(destination, ".generated-assets");
if (fs.existsSync(destination) && !fs.existsSync(marker)) throw new Error("Refusing to overwrite an unowned branding directory.");
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(marker, "Derived from canonical assets; rebuilt by branding:build.\n");
// Only remove previously generated PNGs, never unrelated application content.
for (const filename of fs.readdirSync(destination)) {
  if (/^[a-z0-9-]+\.png$/.test(filename) && !catalog.assets.some(a => `${a.id}.png` === filename)) {
    fs.unlinkSync(path.join(destination, filename));
  }
}
for (const asset of catalog.assets) fs.copyFileSync(safeAssetPath(root, asset.path), path.join(destination, `${asset.id}.png`));
fs.mkdirSync(path.join(appRoot, ".generated"), { recursive: true });
fs.writeFileSync(path.join(appRoot, ".generated/branding.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log(`Branding validated: ${full.uniforms.length} uniforms, ${full.assets.length} PNG assets. Published: ${catalog.uniforms.length} uniform, ${catalog.assets.length} assets.`);

const portraitManifest = JSON.parse(fs.readFileSync(path.join(root, "assets/players/portraits-v2/manifest.json"), "utf8")) as { portraits: PlayerPortraitAsset[] };
const portraits = portraitManifest.portraits.filter(p => manifest.enabledPlayers.includes(p.playerId));
if (new Set(portraits.map(p => p.playerId)).size !== portraits.length) throw new Error("Duplicate portrait identity");
const portraitDirectory = path.join(appRoot, "public/portraits");
if (fs.existsSync(portraitDirectory) && !fs.existsSync(path.join(portraitDirectory, ".generated-assets"))) throw new Error("Unowned portraits directory");
fs.mkdirSync(portraitDirectory, { recursive: true });
fs.writeFileSync(path.join(portraitDirectory, ".generated-assets"), "Generated publication copies only.\n");
for (const filename of fs.readdirSync(portraitDirectory)) {
  if (/^[a-z0-9-]+\.png$/.test(filename) && !portraits.some(p => `${p.playerId}.png` === filename)) fs.unlinkSync(path.join(portraitDirectory, filename));
}
for (const portrait of portraits) {
  const source = safeAssetPath(root, portrait.file);
  const bytes = fs.readFileSync(source);
  if (createHash("sha256").update(bytes).digest("hex") !== portrait.sha256 || bytes.readUInt32BE(16) !== portrait.width || bytes.readUInt32BE(20) !== portrait.height) throw new Error(`Invalid portrait: ${portrait.playerId}`);
  const player = JSON.parse(fs.readFileSync(path.join(root, "data/players", portrait.playerId + ".json"), "utf8"));
  if (player.ageAtCurrentStoryDate !== portrait.age) throw new Error(`Portrait age mismatch: ${portrait.playerId}`);
  fs.copyFileSync(source, path.join(portraitDirectory, `${portrait.playerId}.png`));
}
fs.writeFileSync(path.join(appRoot, ".generated/portraits.json"), JSON.stringify(portraits, null, 2) + "\n");
console.log(`Portraits validated and published: ${portraits.length}.`);
