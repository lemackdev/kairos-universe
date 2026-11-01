import fs from "node:fs";
import path from "node:path";

import type { KairospediaCatalog } from "@/types/catalog";
import { readJson } from "@/lib/canon/json";
import {
  generatedRoot,
  repositoryRoot,
  websiteRoot,
} from "@/lib/canon/paths";

const catalog = readJson<KairospediaCatalog>(
  path.join(generatedRoot, "catalog.json"),
);
const routes = new Set(catalog.routes);
const required = [
  "/wiki",
  "/wiki/about",
  "/wiki/search",
  "/wiki/games",
  "/wiki/games/league-of-legends",
  "/wiki/organizations",
  "/wiki/organizations/kairos-esports",
  "/wiki/teams",
  "/wiki/teams/kairos-lol-main",
  "/wiki/players",
  "/wiki/staff",
  "/wiki/competitions",
  "/wiki/matches",
  "/wiki/transfers",
];

required.forEach((route) => {
  if (!routes.has(route)) {
    throw new Error(`Required route missing from catalog: ${route}`);
  }
});

const sourceRoot = path.join(websiteRoot, "src");
for (const file of walk(sourceRoot)) {
  if (!/\.(tsx|ts)$/.test(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/href=["'](\/wiki[^"'#]*)["']/g)) {
    const href = match[1];
    if (href && !routes.has(href)) {
      throw new Error(
        `Static internal link is not generated: ${path.relative(websiteRoot, file)} -> ${href}`,
      );
    }
  }
}

const serialized = JSON.stringify(catalog);
const publication = readJson<{ enabledTeams: string[] }>(path.join(websiteRoot, "kairospedia-publication.json"));
const teamFiles = readJson<string[]>(path.join(repositoryRoot, "index/teams.json"));
for (const file of teamFiles) {
  const team = readJson<{ id: string }>(path.join(repositoryRoot, file));
  if (!publication.enabledTeams.includes(team.id) && serialized.includes(team.id)) {
    throw new Error(`Hidden canonical entity leaked into catalog: ${team.id}`);
  }
}

let markdownLinks = 0;
for (const file of walkMarkdown(repositoryRoot)) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const rawTarget = match[1]?.trim();
    if (
      !rawTarget ||
      rawTarget.startsWith("#") ||
      /^(https?:|mailto:)/i.test(rawTarget)
    ) {
      continue;
    }
    const targetWithoutAnchor = rawTarget.split("#")[0]?.split("?")[0];
    if (!targetWithoutAnchor) continue;
    const decoded = decodeURIComponent(targetWithoutAnchor);
    const resolved = path.resolve(path.dirname(file), decoded);
    if (!fs.existsSync(resolved)) {
      throw new Error(
        `Broken Markdown link: ${path.relative(repositoryRoot, file)} -> ${rawTarget}`,
      );
    }
    markdownLinks += 1;
  }
}

if (!fs.existsSync(path.join(websiteRoot, ".next"))) {
  throw new Error("Production output is missing. Run this validator after next build.");
}

console.log(
  `Internal links valid across ${routes.size} generated routes and ${markdownLinks} local Markdown links.`,
);

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function walkMarkdown(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.isDirectory() &&
      [".git", ".generated", ".next", "node_modules"].includes(entry.name)
    ) {
      return [];
    }
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(fullPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}
