import { describe, expect, it } from "vitest";

import {
  loadCanonUniverse,
  loadPublicationManifest,
} from "@/lib/canon/loader";
import { validateCanonUniverse } from "@/lib/validation/canon";

describe("canonical repository validation", () => {
  it("validates schemas, stable IDs, slugs, references, and indexes", () => {
    const report = validateCanonUniverse(
      loadCanonUniverse(),
      loadPublicationManifest(),
    );
    expect(report.entitiesValidated).toBeGreaterThan(75);
    expect(report.referencesChecked).toBeGreaterThan(0);
    expect(report.warnings).toEqual([]);
  });
});
