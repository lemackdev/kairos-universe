import fs from "node:fs";
import path from "node:path";

import { readJson } from "../src/lib/canon/json";
import { generatedRoot, kairosdbRoot, repositoryRoot } from "../src/lib/canon/paths";
import type { KairosDbCatalog } from "../src/lib/canon/server";

const catalog = readJson<KairosDbCatalog>(path.join(generatedRoot, "catalog.json"));

const staticRoutes = new Set([
  "/",
  "/about",
  "/sources",
  "/snapshot",
  "/regions",
  "/organizations",
  "/teams",
  "/players",
  "/staff",
  "/transfers",
  "/competitions",
  "/matches",
  "/search",
  "/snapshots/leaguepedia-2026-08-03",
  "/snapshots/leaguepedia-2026-08-03/teams",
  "/snapshots/leaguepedia-2026-08-03/players",
]);

const dynamicRoutes = new Set<string>();
for (const p of catalog.kairos.players) dynamicRoutes.add(`/players/${p.slug}`);
dynamicRoutes.add(`/teams/${catalog.kairos.team.slug}`);
for (const t of catalog.external.teams) dynamicRoutes.add(`/teams/${t.slug}`);
for (const p of catalog.external.players) dynamicRoutes.add(`/players/${p.slug}`);
for (const s of catalog.external.staff) dynamicRoutes.add(`/staff/${s.slug}`);
for (const o of catalog.external.organizations) dynamicRoutes.add(`/organizations/${o.slug}`);

const allRoutes = new Set([...staticRoutes, ...dynamicRoutes]);

for (const route of staticRoutes) {
  if (!allRoutes.has(route)) {
    throw new Error(`Required route missing: ${route}`);
  }
}

let internalHrefs = 0;
for (const file of walk(path.join(kairosdbRoot, "src"))) {
  if (!/\.(tsx|ts)$/.test(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/href=\{?["'`](\/[^"'`#{}]*)["'`]\}?/g)) {
    const href = match[1];
    if (!href || href.startsWith("http")) continue;
    internalHrefs += 1;
    if (!allRoutes.has(href) && !href.startsWith("/snapshots/leaguepedia-2026-08-03/regions/")) {
      throw new Error(
        `Static internal link is not a known KairosDB route: ${path.relative(kairosdbRoot, file)} -> ${href}`,
      );
    }
  }
}

let markdownLinks = 0;
for (const file of walkMarkdown(repositoryRoot)) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const rawTarget = match[1]?.trim();
    if (!rawTarget || rawTarget.startsWith("#") || /^(https?:|mailto:)/i.test(rawTarget)) continue;
    const targetWithoutAnchor = rawTarget.split("#")[0]?.split("?")[0];
    if (!targetWithoutAnchor) continue;
    const decoded = decodeURIComponent(targetWithoutAnchor);
    const resolved = path.resolve(path.dirname(file), decoded);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Broken Markdown link: ${path.relative(repositoryRoot, file)} -> ${rawTarget}`);
    }
    markdownLinks += 1;
  }
}

if (!fs.existsSync(path.join(kairosdbRoot, ".next"))) {
  throw new Error("Production output is missing. Run this validator after next build.");
}

console.log(
  `KairosDB internal links valid across ${allRoutes.size} routes (${internalHrefs} hrefs checked) and ${markdownLinks} repository-wide Markdown links.`,
);

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function walkMarkdown(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.isDirectory() &&
      [".git", ".generated", ".next", "node_modules", "raw"].includes(entry.name)
    ) {
      return [];
    }
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}
