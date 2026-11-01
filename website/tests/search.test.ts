import { beforeAll, describe, expect, it } from "vitest";

import type { SearchRecord } from "@/types/catalog";
import { buildCatalog } from "@/lib/catalog/build";
import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";
import { buildSearchRecords, searchRecords } from "@/lib/search/search";

let records: SearchRecord[];

beforeAll(() => {
  records = buildSearchRecords(
    buildCatalog(loadCanonUniverse(), loadPublicationManifest()),
  );
});

describe("local publication search", () => {
  it.each([
    ["rkN", "noah-rkn-bennett"],
    ["Vanta", "ethan-vanta-walker"],
    ["404", "mason-404-brooks"],
    ["Aster", "liam-aster-oconnor"],
    ["Moss", "daniel-moss-reyes"],
    ["Noah Bennett", "noah-rkn-bennett"],
    ["Ethan Walker", "ethan-vanta-walker"],
    ["Mason Brooks", "mason-404-brooks"],
    ["Liam O'Connor", "liam-aster-oconnor"],
    ["Daniel Reyes", "daniel-moss-reyes"],
  ])("finds %s", (query, expectedId) => {
    expect(searchRecords(records, query)[0]?.id).toBe(expectedId);
  });

  it("finds the published team and excludes hidden canon", () => {
    expect(searchRecords(records, "Kairos Gaming")[0]?.id).toBe(
      "kairos-lol-main",
    );
    expect(searchRecords(records, "Academy")).toEqual([]);
    expect(searchRecords(records, "Counter-Strike").some((record) => record.id === "game-counter-strike")).toBe(true);
  });
});
