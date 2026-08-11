import { describe, expect, it } from "vitest";

import {
  isCoachingStaffRole,
  isManagementStaffRole,
  mapInGameRole,
  splitRoles,
} from "../scripts/leaguepedia/roles";

describe("mapInGameRole", () => {
  it("maps ADC to bot", () => {
    expect(mapInGameRole("ADC")).toBe("bot");
  });

  it("maps known roles case-insensitively", () => {
    expect(mapInGameRole("Jungle")).toBe("jungle");
    expect(mapInGameRole("support")).toBe("support");
    expect(mapInGameRole("Mid")).toBe("mid");
    expect(mapInGameRole("Top")).toBe("top");
  });

  it("never forces an unrecognized role into a position", () => {
    expect(mapInGameRole("Head Coach")).toBe("unknown");
    expect(mapInGameRole(undefined)).toBe("unknown");
    expect(mapInGameRole("")).toBe("unknown");
  });
});

describe("splitRoles", () => {
  it("splits comma and slash separated roles", () => {
    expect(splitRoles("Top, Jungle")).toEqual(["Top", "Jungle"]);
    expect(splitRoles("Sub/Top")).toEqual(["Sub", "Top"]);
  });

  it("returns an empty array for missing input", () => {
    expect(splitRoles(undefined)).toEqual([]);
    expect(splitRoles(null)).toEqual([]);
    expect(splitRoles("")).toEqual([]);
  });
});

describe("staff role classification", () => {
  it("recognizes coaching roles", () => {
    expect(isCoachingStaffRole("Head Coach")).toBe(true);
    expect(isCoachingStaffRole("assistant coach")).toBe(true);
  });

  it("does not classify management roles as coaching", () => {
    expect(isCoachingStaffRole("Owner")).toBe(false);
    expect(isManagementStaffRole("Owner")).toBe(true);
    expect(isManagementStaffRole("Head Coach")).toBe(false);
  });
});
