import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export interface VisualAsset {
  id: string; slug: string; path: string; mimeType: "image/png";
  organizationId: string; season: number | null; category: "logo" | "uniform";
  orientation: "logo" | "front" | "back"; color: string; canonStatus: string;
  teamIds: string[]; source: string; importDate: string; width: number; height: number;
  sha256: string; referencePath: string; referenceSha256: string;
  processing: string; garmentHeight: number | null; notes: string[];
}

export interface Uniform {
  id: string; slug: string; name: string; season: number; organizationId: string;
  type: "main" | "academy"; primaryColor: string; accentColor: string;
  teamIds: string[]; frontAsset: string; backAsset: string; canonStatus: string; meaning: string;
  technicalSupplier: { name: string; status: string; roles: string[]; expectedScope: string[];
    contractValue: null; contractDuration: null; announcementDate: null; legalTerms: null; exclusivity: null };
  institutionalPartner: { organizationId: string; name: string; relationship: string; role: string };
  canonNotes: string[];
}

export interface BrandingCatalog { assets: VisualAsset[]; uniforms: Uniform[] }

function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function safeAssetPath(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  requireThat(relative.startsWith("assets/") && resolved.startsWith(path.resolve(root, "assets") + path.sep), `Unsafe asset path: ${relative}`);
  return resolved;
}

export function loadBranding(root: string): BrandingCatalog {
  const read = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  const collection = <T,>(name: string): T[] => read<string[]>(`index/${name}.json`).map(file => read<T>(file));
  const catalog = { assets: collection<VisualAsset>("visual-assets"), uniforms: collection<Uniform>("uniforms") };
  const teams = new Set(collection<{ id: string }>("teams").map(t => t.id));
  const organizations = new Set(collection<{ id: string }>("organizations").map(o => o.id));
  const ids = new Set<string>();
  for (const record of [...catalog.assets, ...catalog.uniforms]) {
    requireThat(!ids.has(record.id), `Duplicate branding ID: ${record.id}`); ids.add(record.id);
    requireThat(organizations.has(record.organizationId), `Unknown organization: ${record.id}`);
    record.teamIds.forEach(id => requireThat(teams.has(id), `Unknown uniform team: ${id}`));
  }
  for (const asset of catalog.assets) {
    const bytes = fs.readFileSync(safeAssetPath(root, asset.path));
    requireThat(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `Not PNG: ${asset.id}`);
    requireThat(bytes.readUInt32BE(16) === asset.width && bytes.readUInt32BE(20) === asset.height, `Wrong dimensions: ${asset.id}`);
    requireThat(createHash("sha256").update(bytes).digest("hex") === asset.sha256, `Asset changed: ${asset.id}`);
    const reference = fs.readFileSync(safeAssetPath(root, asset.referencePath));
    requireThat(createHash("sha256").update(reference).digest("hex") === asset.referenceSha256, `Reference changed: ${asset.id}`);
    if (asset.category === "uniform") {
      requireThat(asset.width === 1400 && asset.height === 1400 && bytes[25] === 6, `Uniform must be 1400px RGBA PNG: ${asset.id}`);
      requireThat(asset.garmentHeight !== null && asset.garmentHeight / asset.height >= .75 && asset.garmentHeight / asset.height <= .85, `Garment framing outside 75-85%: ${asset.id}`);
    } else requireThat(asset.sha256 === asset.referenceSha256, `Original logo changed: ${asset.id}`);
  }
  const assignments = new Set<string>();
  for (const uniform of catalog.uniforms) {
    requireThat(organizations.has(uniform.institutionalPartner.organizationId), `Unknown institutional partner: ${uniform.id}`);
    for (const orientation of ["front", "back"] as const) {
      const asset = catalog.assets.find(a => a.id === uniform[`${orientation}Asset`]);
      requireThat(asset && asset.orientation === orientation && asset.color === uniform.primaryColor && asset.season === uniform.season, `Invalid ${orientation} asset: ${uniform.id}`);
      requireThat(JSON.stringify(asset.teamIds) === JSON.stringify(uniform.teamIds), `Asset team mismatch: ${uniform.id}`);
    }
    for (const teamId of uniform.teamIds) {
      const key = `${teamId}:${uniform.season}`;
      requireThat(!assignments.has(key), `Duplicate team uniform: ${key}`); assignments.add(key);
    }
  }
  return catalog;
}

export function filterBranding(catalog: BrandingCatalog, teamIds: string[]): BrandingCatalog {
  const uniforms = catalog.uniforms.filter(u => u.teamIds.some(id => teamIds.includes(id)))
    .map(u => ({ ...u, teamIds: u.teamIds.filter(id => teamIds.includes(id)) }));
  const assetIds = new Set(uniforms.flatMap(u => [u.frontAsset, u.backAsset]));
  const organizations = new Set(uniforms.flatMap(u => [u.organizationId, u.institutionalPartner.organizationId]));
  const assets = catalog.assets.filter(a => assetIds.has(a.id) || (a.category === "logo" && organizations.has(a.organizationId)))
    .map(a => ({ ...a, teamIds: a.teamIds.filter(id => teamIds.includes(id)) }));
  return { uniforms, assets };
}

export function readPublishedBranding(appRoot = process.cwd()): BrandingCatalog {
  return JSON.parse(fs.readFileSync(path.join(appRoot, ".generated", "branding.json"), "utf8"));
}

export function assetUrl(asset: VisualAsset): string { return `/branding/${asset.id}.png`; }

export interface PlayerPortraitAsset {
  playerId: string; file: string; width: number; height: number; sha256: string;
  age: number; altText: string; sourceRecord: string;
}

export function readPublishedPortraits(appRoot = process.cwd()): PlayerPortraitAsset[] {
  return JSON.parse(fs.readFileSync(path.join(appRoot, ".generated/portraits.json"), "utf8"));
}

export interface TeamLineupAsset {
  teamId: string; file: string; width: number; height: number; sha256: string; playerIds: string[];
}

export function readPublishedTeamLineups(appRoot = process.cwd()): TeamLineupAsset[] {
  return JSON.parse(fs.readFileSync(path.join(appRoot, ".generated/team-lineups.json"), "utf8"));
}
