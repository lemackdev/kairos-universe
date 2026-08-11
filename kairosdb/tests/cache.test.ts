import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  rawResponseExists,
  readRawResponse,
  sha256,
  writeRawResponse,
} from "../scripts/leaguepedia/cache";

describe("cache", () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "kairosdb-cache-test-"));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("checksums identical content identically and different content differently", () => {
    expect(sha256("a")).toBe(sha256("a"));
    expect(sha256("a")).not.toBe(sha256("b"));
  });

  it("writes and reads back raw responses, and reports existence", () => {
    expect(rawResponseExists(dir, "query-1")).toBe(false);

    const { filePath, checksum } = writeRawResponse(dir, "query-1", { rows: [1, 2, 3] });

    expect(rawResponseExists(dir, "query-1")).toBe(true);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(checksum).toBe(sha256(JSON.stringify({ rows: [1, 2, 3] }, null, 2)));

    const readBack = readRawResponse<{ rows: number[] }>(filePath);
    expect(readBack).toEqual({ rows: [1, 2, 3] });
  });

  it("returns null for a raw response that was never written", () => {
    expect(readRawResponse(path.join(dir, "missing.json"))).toBeNull();
  });
});
