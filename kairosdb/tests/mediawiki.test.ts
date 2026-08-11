import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rawMediawikiRoot } from "../scripts/leaguepedia/config";
import { fetchPageRevisions } from "../scripts/leaguepedia/mediawiki";
import { ImportManifest } from "../scripts/leaguepedia/manifest";

const TEST_BATCH_LABEL = "test-redirects-mediawiki-spec";

describe("fetchPageRevisions — redirect resolution", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    for (const file of fs.existsSync(rawMediawikiRoot) ? fs.readdirSync(rawMediawikiRoot) : []) {
      if (file.startsWith(TEST_BATCH_LABEL)) {
        fs.rmSync(`${rawMediawikiRoot}/${file}`);
      }
    }
  });

  it("resolves a redirected title to its target and records the redirect", async () => {
    global.fetch = vi.fn(async () => ({
      status: 200,
      json: async () => ({
        query: {
          redirects: [{ from: "Old Player Name", to: "New Player Name" }],
          pages: {
            "42": {
              pageid: 42,
              ns: 0,
              title: "New Player Name",
              revisions: [{ revid: 999, timestamp: "2026-08-01T00:00:00Z" }],
            },
          },
        },
      }),
    })) as unknown as typeof fetch;

    const manifest = new ImportManifest();
    const results = await fetchPageRevisions(["Old Player Name"], TEST_BATCH_LABEL, manifest);

    expect(results).toHaveLength(1);
    expect(results[0]?.requestedTitle).toBe("Old Player Name");
    expect(results[0]?.resolvedTitle).toBe("New Player Name");
    expect(results[0]?.redirectTarget).toBe("New Player Name");
    expect(results[0]?.revisionId).toBe(999);
    expect(results[0]?.missing).toBe(false);
  });

  it("marks a page missing rather than fabricating a revision", async () => {
    global.fetch = vi.fn(async () => ({
      status: 200,
      json: async () => ({
        query: {
          pages: {
            "-1": {
              ns: 0,
              title: "Nonexistent Page",
              missing: "",
            },
          },
        },
      }),
    })) as unknown as typeof fetch;

    const manifest = new ImportManifest();
    const results = await fetchPageRevisions(["Nonexistent Page"], `${TEST_BATCH_LABEL}-missing`, manifest);

    expect(results[0]?.missing).toBe(true);
    expect(results[0]?.revisionId).toBeNull();

    for (const file of fs.readdirSync(rawMediawikiRoot)) {
      if (file.startsWith(`${TEST_BATCH_LABEL}-missing`)) fs.rmSync(`${rawMediawikiRoot}/${file}`);
    }
  });

  it("batches more than one title per request up to the batch size", async () => {
    let requestedTitles: string[] = [];
    global.fetch = vi.fn(async (url: string | URL) => {
      requestedTitles = new URL(url).searchParams.get("titles")?.split("|") ?? [];
      return {
        status: 200,
        json: async () => ({
          query: {
            pages: Object.fromEntries(
              requestedTitles.map((t, i) => [
                String(i),
                { pageid: i, ns: 0, title: t, revisions: [{ revid: i, timestamp: "2026-08-01T00:00:00Z" }] },
              ]),
            ),
          },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const manifest = new ImportManifest();
    const titles = ["A", "B", "C"];
    await fetchPageRevisions(titles, `${TEST_BATCH_LABEL}-batch`, manifest);

    expect(requestedTitles).toEqual(titles);

    for (const file of fs.readdirSync(rawMediawikiRoot)) {
      if (file.startsWith(`${TEST_BATCH_LABEL}-batch`)) fs.rmSync(`${rawMediawikiRoot}/${file}`);
    }
  });
});
