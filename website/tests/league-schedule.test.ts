import { describe, expect, it } from "vitest";
import { buildLeagueSchedule } from "@/lib/leagueSchedule";

const teams = Array.from({ length: 8 }, (_, i) => ({ key: `t${i}`, name: `Team ${i}` }));

describe("league schedule", () => {
  const weeks = buildLeagueSchedule(teams, "2027-02-15", "2027-09-19", [{ start: "2027-03-20", end: "2027-03-28" }]);

  it("plays every pair exactly once in seven rounds of four", () => {
    expect(weeks).toHaveLength(7);
    const pairs = weeks.flatMap((week) => week.days.flatMap((day) => day.matches.map((m) => [m.home.key, m.away.key].sort().join("-"))));
    expect(pairs).toHaveLength(28);
    expect(new Set(pairs).size).toBe(28);
    weeks.forEach((week) => expect(week.days.reduce((sum, day) => sum + day.matches.length, 0)).toBe(4));
  });

  it("uses Friday to Sunday inside the window and avoids blackouts", () => {
    for (const week of weeks) {
      expect(week.start >= "2027-02-15" && week.end <= "2027-09-19").toBe(true);
      expect(new Date(`${week.start}T00:00:00Z`).getUTCDay()).toBe(5);
      expect(week.start > "2027-03-28" || week.end < "2027-03-20").toBe(true);
    }
  });
});
