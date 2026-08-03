import fs from "node:fs";
import path from "node:path";

import {
  getCollection,
  loadCanonUniverse,
} from "@/lib/canon/loader";
import { generatedRoot, repositoryRoot } from "@/lib/canon/paths";
import { writeJson } from "@/lib/canon/json";
import type { SourceRecord } from "@/types/canon";

const supportedTypes = new Set([
  "organization",
  "team",
  "player",
  "staff",
  "roster-tenure",
  "transfer",
  "competition",
  "match",
]);

const [entityType, ...args] = process.argv.slice(2);
if (!entityType || !supportedTypes.has(entityType)) {
  fail(`Expected entity type: ${[...supportedTypes].join(", ")}`);
}

const id = readOption(args, "--id");
const slug = readOption(args, "--slug") ?? id;
const sourceIds = readRepeatedOption(args, "--source");

if (!id || !isStableId(id)) {
  fail("--id is required and must be lowercase kebab-case.");
}
if (!slug || !isStableId(slug)) {
  fail("--slug must be lowercase kebab-case.");
}
if (sourceIds.length === 0) {
  fail("At least one --source stable ID is required.");
}

const universe = loadCanonUniverse();
const allRecords = Object.values(universe.collections).flat();
if (allRecords.some((record) => record.id === id)) {
  fail(`Stable ID already exists: ${id}`);
}
if (allRecords.some((record) => record.slug === slug)) {
  fail(`Canonical slug already exists: ${slug}`);
}

const sourceRecords = new Set(
  getCollection<SourceRecord>(universe, "sources").map(
    (source) => source.id,
  ),
);
sourceIds.forEach((sourceId) => {
  if (!sourceRecords.has(sourceId)) {
    fail(`Source ID does not resolve: ${sourceId}`);
  }
});

const outputDirectory = path.join(generatedRoot, "drafts", entityType);
const outputPath = path.join(outputDirectory, `${id}.json`);
if (fs.existsSync(outputPath)) {
  fail(`Draft already exists and will not be overwritten: ${outputPath}`);
}

fs.mkdirSync(outputDirectory, { recursive: true });
writeJson(outputPath, {
  draftSchemaVersion: 1,
  entityType,
  id,
  slug,
  status: "draft",
  canonStatus: "unconfirmed",
  continuityId: "kairos-universe",
  sourceIds,
  dates: {},
  fields: {},
});

const target = canonicalTarget(entityType, id);
console.log(`Created draft: ${path.relative(repositoryRoot, outputPath)}`);
console.log(`Manual promotion target: ${target}`);
console.log(`Manual index update: index/${indexName(entityType)}.json`);
console.log("Required next steps: complete fields, validate sources, promote deliberately, run npm run validate.");

function readOption(values: string[], flag: string): string | undefined {
  const index = values.indexOf(flag);
  return index >= 0 ? values[index + 1] : undefined;
}

function readRepeatedOption(values: string[], flag: string): string[] {
  return values.flatMap((value, index) =>
    value === flag && values[index + 1] ? [values[index + 1] as string] : [],
  );
}

function isStableId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function canonicalTarget(type: string, stableId: string): string {
  const directory =
    type === "staff"
      ? "coaches"
      : type === "roster-tenure"
        ? "roster-tenures"
        : `${type}s`;
  return `data/${directory}/${stableId}.json`;
}

function indexName(type: string): string {
  if (type === "staff") return "coaches";
  if (type === "roster-tenure") return "roster-tenures";
  return `${type}s`;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
