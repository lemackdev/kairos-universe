import { describe, expect, it } from "vitest";

import { ImportManifest, isStepComplete, type Checkpoint } from "../scripts/leaguepedia/manifest";

// These tests exercise only the in-memory behavior (no .load()/.save(),
// which would touch the shared snapshot directory a real import run may be
// concurrently writing to).

describe("ImportManifest (in-memory)", () => {
  it("assigns increasing sequence numbers and preserves entries", () => {
    const manifest = new ImportManifest();
    manifest.record({
      kind: "cargo",
      description: "first",
      requestUrl: "https://example.test/a",
      rawFile: "a.json",
      rowCount: 1,
      checksum: "abc",
      issuedAt: "2026-08-03T00:00:00Z",
    });
    manifest.record({
      kind: "mediawiki",
      description: "second",
      requestUrl: "https://example.test/b",
      rawFile: "b.json",
      rowCount: 2,
      checksum: "def",
      issuedAt: "2026-08-03T00:00:01Z",
    });

    const entries = manifest.all();
    expect(entries).toHaveLength(2);
    expect(entries[0]?.sequence).toBe(1);
    expect(entries[1]?.sequence).toBe(2);
  });

  it("resumes sequence numbering from existing entries", () => {
    const manifest = new ImportManifest([
      {
        sequence: 5,
        kind: "cargo",
        description: "existing",
        requestUrl: "https://example.test/z",
        rawFile: "z.json",
        rowCount: 1,
        checksum: "zzz",
        issuedAt: "2026-08-03T00:00:00Z",
      },
    ]);
    manifest.record({
      kind: "cargo",
      description: "new",
      requestUrl: "https://example.test/y",
      rawFile: "y.json",
      rowCount: 1,
      checksum: "yyy",
      issuedAt: "2026-08-03T00:00:02Z",
    });
    expect(manifest.all().at(-1)?.sequence).toBe(6);
  });
});

describe("checkpoint (in-memory)", () => {
  it("tracks completed steps without touching disk", () => {
    const checkpoint: Checkpoint = { completedSteps: {}, updatedAt: "" };
    expect(isStepComplete(checkpoint, "teams")).toBe(false);
    checkpoint.completedSteps.teams = true;
    expect(isStepComplete(checkpoint, "teams")).toBe(true);
    expect(isStepComplete(checkpoint, "tenures")).toBe(false);
  });
});
