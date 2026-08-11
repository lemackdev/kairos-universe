import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Writes raw JSON to disk under `dir/name.json`, keyed by a caller-supplied
 * deterministic name (not a random UUID) so re-running the same query
 * against a resumed import reuses the same file path.
 */
export function writeRawResponse(
  dir: string,
  name: string,
  data: unknown,
): { filePath: string; checksum: string } {
  ensureDir(dir);
  const content = JSON.stringify(data, null, 2);
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, content, "utf8");
  return { filePath, checksum: sha256(content) };
}

export function readRawResponse<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function rawResponseExists(dir: string, name: string): boolean {
  return fs.existsSync(path.join(dir, `${name}.json`));
}
