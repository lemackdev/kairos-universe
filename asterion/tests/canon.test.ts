import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildSnapshot } from "../scripts/sync-canon.mjs";
import { canon, isUnknown } from "@/content/canon";
import { disciplines, principles } from "@/content/proposed";
import {
  clamp01,
  explodeAt,
  parts,
  partX,
  smoothstep,
  stepIndexAt,
  steps,
} from "@/lib/assembly";

const repoOrgs = path.resolve(import.meta.dirname, "..", "..", "data", "organizations");
const hasRepo = fs.existsSync(path.join(repoOrgs, "asterion-intelligence.json"));

describe("canon snapshot", () => {
  it.skipIf(!hasRepo)("matches the canon records it was generated from", () => {
    const read = (name: string) =>
      JSON.parse(fs.readFileSync(path.join(repoOrgs, name), "utf8"));
    const fresh = buildSnapshot(
      read("asterion-intelligence.json"),
      read("kairos-esports.json"),
    );
    expect(canon).toEqual(fresh);
  });

  it("keeps undefined corporate details undefined", () => {
    expect(isUnknown(canon.asterion.headquarters.city)).toBe(true);
    expect(canon.asterion.unconfirmedDetails.length).toBeGreaterThan(0);
  });

  it("states the confirmed relationship", () => {
    expect(canon.asterion.subsidiaries.map((s) => s.organizationId)).toEqual(["kairos-esports"]);
    expect(canon.kairos.parentName).toBe(canon.asterion.name);
  });
});

describe("proposed content", () => {
  const banned = /\b(revenue|valuation|clients?|customers?|headcount|founded in|\$\d)/i;

  it("does not assert unconfirmed commercial facts", () => {
    for (const item of [...principles, ...disciplines]) {
      const text = JSON.stringify(item);
      expect(text).not.toMatch(banned);
    }
  });

  it("uses unique ids", () => {
    expect(new Set(disciplines.map((d) => d.id)).size).toBe(disciplines.length);
    expect(new Set(principles.map((p) => p.id)).size).toBe(principles.length);
  });
});

describe("reference assembly", () => {
  it("has unique part ids and indexes", () => {
    expect(new Set(parts.map((p) => p.id)).size).toBe(parts.length);
    expect(new Set(parts.map((p) => p.index)).size).toBe(parts.length);
  });

  it("explodes monotonically from 0 to 1", () => {
    expect(explodeAt(0)).toBe(0);
    expect(explodeAt(1)).toBe(1);
    let previous = -1;
    for (let i = 0; i <= 20; i += 1) {
      const value = explodeAt(i / 20);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it("separates every part at full explode", () => {
    const xs = parts.filter((p) => p.id !== "spindle" && p.id !== "carrier").map((p) => partX(p, 1));
    expect(new Set(xs.map((x) => x.toFixed(2))).size).toBe(xs.length);
  });

  it("orders steps by threshold and resolves them from progress", () => {
    const froms = steps.map((s) => s.from);
    expect([...froms].sort((a, b) => a - b)).toEqual(froms);
    expect(stepIndexAt(0)).toBe(0);
    expect(stepIndexAt(1)).toBe(steps.length - 1);
  });

  it("clamps helpers", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
  });
});
