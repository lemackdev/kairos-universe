import { describe, expect, it } from "vitest";

import { calculateAge } from "@/lib/canon/age";
import { formatUnknown } from "@/lib/formatting/unknown";

describe("narrative age and unknown formatting", () => {
  it("calculates age using the Kairos narrative date", () => {
    expect(calculateAge("2009-02-14", "2026-11-24")).toBe(17);
    expect(calculateAge("2008-09-09", "2026-11-24")).toBe(18);
  });

  it("does not replace unknown canon with a guess", () => {
    expect(calculateAge("TBD", "2026-11-24")).toBeNull();
    expect(formatUnknown("TBD")).toBe("Unknown");
    expect(formatUnknown(null, "TBD")).toBe("TBD");
  });
});
