import { describe, expect, it } from "vitest";

import type {
  LineupRecord,
  MatchRecord,
  RosterTenure,
  StaffTenure,
} from "@/types/canon";
import {
  getCollection,
  loadCanonUniverse,
} from "@/lib/canon/loader";
import {
  getOfficialMatches,
  getPrivatePractice,
} from "@/lib/canon/matches";
import {
  getActiveRoster,
  getMatchLineup,
  getPlayerTeamHistory,
  getTeamStaffAtDate,
} from "@/lib/canon/tenures";

describe("historical roster and match context engines", () => {
  const universe = loadCanonUniverse();
  const rosterTenures = getCollection<RosterTenure>(
    universe,
    "roster-tenures",
  );
  const staffTenures = getCollection<StaffTenure>(universe, "staff-tenures");

  it("resolves the current five-player roster and captain at the narrative date", () => {
    const roster = getActiveRoster(
      rosterTenures,
      "kairos-lol-main",
      "2026-11-24",
    );
    expect(roster).toHaveLength(5);
    expect(roster.filter((tenure) => tenure.isCaptain).map((tenure) => tenure.playerId)).toEqual([
      "daniel-moss-reyes",
    ]);
  });

  it("resolves player and staff histories without inventing dates", () => {
    expect(getPlayerTeamHistory(rosterTenures, "mason-404-brooks")).toHaveLength(1);
    expect(
      getTeamStaffAtDate(
        staffTenures,
        "kairos-lol-main",
        "division-league-of-legends",
        "2026-11-24",
      ),
    ).toHaveLength(3);
  });

  it("preserves exact historical lineups", () => {
    const lineup: LineupRecord = {
      id: "lineup-example",
      matchId: "match-example",
      teamId: "kairos-lol-main",
      playerIds: ["noah-rkn-bennett"],
      substitutePlayerIds: [],
      coachIds: [],
      captainPlayerId: "daniel-moss-reyes",
      roleAssignments: {},
    };
    expect(getMatchLineup([lineup], "match-example", "kairos-lol-main")).toBe(
      lineup,
    );
    expect(getMatchLineup([lineup], "other-match", "kairos-lol-main")).toBeNull();
  });

  it("never mixes official matches with private practice", () => {
    const matches: MatchRecord[] = [
      {
        id: "official-example",
        matchType: "official-match",
        visibility: "public",
        officialStatus: "official",
      },
      {
        id: "private-example",
        matchType: "private-scrim",
        visibility: "private",
        officialStatus: "practice",
      },
    ];
    expect(getOfficialMatches(matches).map((match) => match.id)).toEqual([
      "official-example",
    ]);
    expect(getPrivatePractice(matches).map((match) => match.id)).toEqual([
      "private-example",
    ]);
  });
});
