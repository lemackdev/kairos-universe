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

const portraitManifestPaths = [
  "assets/players/portraits-v2/manifest.json",
  "assets/players/portraits-academy-blue/manifest.json",
  "assets/players/portraits-academy-white/manifest.json",
  "assets/players/portraits-cs-academy/manifest.json",
];
const allPortraits = portraitManifestPaths.flatMap(file => {
  const collection = JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as { portraits: PlayerPortraitAsset[] };
  return collection.portraits;
});
if (new Set(allPortraits.map(p => p.playerId)).size !== allPortraits.length) throw new Error("Duplicate portrait identity");
const portraits = allPortraits.filter(p => manifest.enabledPlayers.includes(p.playerId));
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

const externalLogoSource = path.join(root, "assets/branding/external");
const externalLogoDestination = path.join(appRoot, "public/branding/external");
if (fs.existsSync(externalLogoSource)) {
  const externalMarker = path.join(externalLogoDestination, ".generated-assets");
  if (fs.existsSync(externalLogoDestination) && !fs.existsSync(externalMarker)) throw new Error("Refusing to overwrite an unowned external branding directory.");
  fs.mkdirSync(externalLogoDestination, { recursive: true });
  fs.writeFileSync(externalMarker, "Derived from assets/branding/external; rebuilt by branding:build.\n");
  const sourceFiles = fs.readdirSync(externalLogoSource).filter(f => f !== ".generated-assets");
  for (const filename of fs.readdirSync(externalLogoDestination)) {
    if (filename !== ".generated-assets" && !sourceFiles.includes(filename)) fs.unlinkSync(path.join(externalLogoDestination, filename));
  }
  for (const filename of sourceFiles) fs.copyFileSync(path.join(externalLogoSource, filename), path.join(externalLogoDestination, filename));
  console.log(`External org logos published: ${sourceFiles.filter(f => f !== "manifest.json").length}.`);
}
