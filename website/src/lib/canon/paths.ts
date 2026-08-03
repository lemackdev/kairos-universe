import path from "node:path";

export const websiteRoot = process.cwd();
export const repositoryRoot = path.resolve(websiteRoot, "..");
export const generatedRoot = path.join(websiteRoot, ".generated");
export const publicationPath = path.join(
  websiteRoot,
  "kairospedia-publication.json",
);
