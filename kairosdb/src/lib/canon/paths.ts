import path from "node:path";

export const kairosdbRoot = process.cwd();
export const repositoryRoot = path.resolve(kairosdbRoot, "..");
export const generatedRoot = path.join(kairosdbRoot, ".generated");

export const kairosDataRoot = path.join(repositoryRoot, "data");
export const kairosIndexRoot = path.join(repositoryRoot, "index");
export const kairosVersionPath = path.join(repositoryRoot, "kairos-version.json");

export const externalDataRoot = path.join(
  repositoryRoot,
  "external-data",
  "leaguepedia",
);
export const overridesRoot = path.join(
  repositoryRoot,
  "data",
  "competitive-world-overrides",
);
