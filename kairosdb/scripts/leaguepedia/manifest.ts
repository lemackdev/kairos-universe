import fs from "node:fs";

import { checkpointJsonPath, manifestJsonPath } from "./config";
import { ensureDir } from "./cache";
import path from "node:path";

export interface QueryManifestEntry {
  sequence: number;
  kind: "cargo" | "mediawiki";
  description: string;
  requestUrl: string;
  rawFile: string;
  rowCount: number;
  checksum: string;
  issuedAt: string;
}

export interface Checkpoint {
  completedSteps: Record<string, true>;
  updatedAt: string;
}

export class ImportManifest {
  private entries: QueryManifestEntry[] = [];
  private sequence = 0;

  constructor(existing?: QueryManifestEntry[]) {
    if (existing) {
      this.entries = existing;
      this.sequence = existing.reduce((max, e) => Math.max(max, e.sequence), 0);
    }
  }

  static load(): ImportManifest {
    if (fs.existsSync(manifestJsonPath)) {
      const raw = JSON.parse(fs.readFileSync(manifestJsonPath, "utf8")) as {
        queries: QueryManifestEntry[];
      };
      return new ImportManifest(raw.queries);
    }
    return new ImportManifest();
  }

  record(entry: Omit<QueryManifestEntry, "sequence">): void {
    this.sequence += 1;
    this.entries.push({ ...entry, sequence: this.sequence });
  }

  all(): QueryManifestEntry[] {
    return this.entries;
  }

  save(): void {
    ensureDir(path.dirname(manifestJsonPath));
    fs.writeFileSync(
      manifestJsonPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalQueries: this.entries.length,
          cargoQueries: this.entries.filter((e) => e.kind === "cargo").length,
          mediawikiQueries: this.entries.filter((e) => e.kind === "mediawiki")
            .length,
          queries: this.entries,
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

export function loadCheckpoint(): Checkpoint {
  if (fs.existsSync(checkpointJsonPath)) {
    return JSON.parse(fs.readFileSync(checkpointJsonPath, "utf8")) as Checkpoint;
  }
  return { completedSteps: {}, updatedAt: new Date().toISOString() };
}

export function saveCheckpoint(checkpoint: Checkpoint): void {
  ensureDir(path.dirname(checkpointJsonPath));
  checkpoint.updatedAt = new Date().toISOString();
  fs.writeFileSync(
    checkpointJsonPath,
    JSON.stringify(checkpoint, null, 2),
    "utf8",
  );
}

export function markStepComplete(checkpoint: Checkpoint, step: string): void {
  checkpoint.completedSteps[step] = true;
  saveCheckpoint(checkpoint);
}

export function isStepComplete(checkpoint: Checkpoint, step: string): boolean {
  return checkpoint.completedSteps[step] === true;
}
