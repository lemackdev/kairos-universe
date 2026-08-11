import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rawCargoRoot } from "../scripts/leaguepedia/config";
import { cargoQueryAll } from "../scripts/leaguepedia/cargo";
import { ImportManifest } from "../scripts/leaguepedia/manifest";

// Uses a query name namespaced to this test file so it can never collide
// with the real "teams-active" / "current-tenures-global" /
// "listplayercurrent-global" cache entries a real import run writes to the
// same directory.
const TEST_QUERY_PREFIX = "test-pagination-cargo-spec";

describe("cargoQueryAll pagination", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    for (const file of fs.existsSync(rawCargoRoot) ? fs.readdirSync(rawCargoRoot) : []) {
      if (file.startsWith(TEST_QUERY_PREFIX)) {
        fs.rmSync(`${rawCargoRoot}/${file}`);
      }
    }
  });

  it("follows offset pagination until a short page, in deterministic order", async () => {
    const pages = [
      Array.from({ length: 3 }, (_, i) => ({ title: { Name: `Row ${i}` } })),
      Array.from({ length: 3 }, (_, i) => ({ title: { Name: `Row ${i + 3}` } })),
      Array.from({ length: 1 }, (_, i) => ({ title: { Name: `Row ${i + 6}` } })),
    ];
    let call = 0;

    global.fetch = vi.fn(async (url: string | URL) => {
      const offset = Number(new URL(url).searchParams.get("offset"));
      const page = pages[offset / 3];
      call += 1;
      return {
        status: 200,
        json: async () => ({ cargoquery: page }),
      } as Response;
    }) as unknown as typeof fetch;

    const manifest = new ImportManifest();
    const rows = await cargoQueryAll(
      TEST_QUERY_PREFIX,
      {
        tables: "Teams",
        fields: "Teams.Name",
        orderBy: "Teams.Name",
        limit: 3,
      },
      manifest,
    );

    expect(rows.map((r) => r.Name)).toEqual([
      "Row 0",
      "Row 1",
      "Row 2",
      "Row 3",
      "Row 4",
      "Row 5",
      "Row 6",
    ]);
    expect(call).toBe(3);
    expect(manifest.all()).toHaveLength(3);
  });

  it("reuses cached raw pages instead of re-fetching on a resumed run", async () => {
    let call = 0;
    global.fetch = vi.fn(async () => {
      call += 1;
      return {
        status: 200,
        json: async () => ({ cargoquery: [{ title: { Name: "Only Row" } }] }),
      } as Response;
    }) as unknown as typeof fetch;

    const manifest = new ImportManifest();
    const first = await cargoQueryAll(
      `${TEST_QUERY_PREFIX}-resume`,
      { tables: "Teams", fields: "Teams.Name", orderBy: "Teams.Name", limit: 5 },
      manifest,
    );
    const second = await cargoQueryAll(
      `${TEST_QUERY_PREFIX}-resume`,
      { tables: "Teams", fields: "Teams.Name", orderBy: "Teams.Name", limit: 5 },
      manifest,
    );

    expect(first).toEqual(second);
    expect(call).toBe(1); // second run was a cache hit, not a new request

    for (const file of fs.readdirSync(rawCargoRoot)) {
      if (file.startsWith(`${TEST_QUERY_PREFIX}-resume`)) {
        fs.rmSync(`${rawCargoRoot}/${file}`);
      }
    }
  });
});
