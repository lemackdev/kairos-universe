import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { csRankingRows, loadWorldState2027 } from "../src/lib/external/worldState2027";

const root = path.resolve(__dirname, "../..");

describe("Counter-Strike world ranking 2027", () => {
  const worldState = loadWorldState2027();
  const rows = csRankingRows(worldState);

  it("ranks only known external teams, highest points first", () => {
    const ids = new Set(worldState.csExternalRosters.teams.map((team) => team.teamId));
    expect(rows.length).toBe(52);
    expect(rows.slice(-2).map((row) => row.teamId)).toEqual(["kairos-cs-main", "kairos-cs-academy"]);
    for (const row of rows.slice(0, 50)) expect(ids.has(row.teamId)).toBe(true);
    expect(rows.map((row) => row.position)).toEqual([...rows.map((row) => row.position)].sort((a, b) => a - b));
    expect(rows.map((row) => row.position)).toEqual(Array.from({ length: 52 }, (_, index) => index + 1));
    expect(rows[0]).toMatchObject({ position: 1, name: "MOUZ" });
    expect(rows.find((row) => row.name === "The MongolZ")).toMatchObject({ position: 10 });
    expect(rows.find((row) => row.name === "MIBR")).toMatchObject({ position: 16 });
    expect(rows.find((row) => row.name === "LAG")).toMatchObject({ position: 50 });
  });

  it("is registered as a source and a route", () => {
    expect(JSON.parse(fs.readFileSync(path.join(root, "index/sources.json"), "utf8"))).toContain("data/sources/source-canon-directive-2027-cs-world-ranking.json");
    const catalog = JSON.parse(fs.readFileSync(path.join(root, "website/.generated/catalog.json"), "utf8"));
    expect(catalog.routes).toContain("/wiki/rankings/counter-strike");
  });
});
