// Deterministic regular-season schedule for single round-robin leagues.
// Matches are best-of-three and played Friday, Saturday and Sunday.
// No results exist yet, so every series is unplayed and every record is 0-0.

export interface ScheduleTeam { key: string; name: string }
export interface ScheduledMatch { home: ScheduleTeam; away: ScheduleTeam }
export interface ScheduleDay { date: string; weekday: "Fri" | "Sat" | "Sun"; matches: ScheduledMatch[] }
export interface ScheduleWeek { number: number; start: string; end: string; days: ScheduleDay[] }
export interface DateRange { start: string; end: string }

const DAY_MS = 86_400_000;
const parse = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

// Circle method: n teams (even) -> n-1 rounds of n/2 matches, every pair once.
export function roundRobinRounds(teams: ScheduleTeam[]): ScheduledMatch[][] {
  const list = teams.slice();
  if (list.length % 2) list.push({ key: "__bye__", name: "BYE" });
  const n = list.length;
  const rounds: ScheduledMatch[][] = [];
  for (let round = 0; round < n - 1; round += 1) {
    const matches: ScheduledMatch[] = [];
    for (let i = 0; i < n / 2; i += 1) {
      const a = list[i]!;
      const b = list[n - 1 - i]!;
      if (a.key === "__bye__" || b.key === "__bye__") continue;
      matches.push(round % 2 === 0 ? { home: a, away: b } : { home: b, away: a });
    }
    rounds.push(matches);
    list.splice(1, 0, list.pop()!);
  }
  return rounds;
}

// Friday-Sunday weekends in [start, end]; weekends overlapping a blackout range are dropped.
function openWeekends(start: string, end: string, blackouts: DateRange[]): number[] {
  const first = parse(start);
  const last = parse(end);
  const offset = (5 - new Date(first).getUTCDay() + 7) % 7;
  const weekends: number[] = [];
  for (let friday = first + offset * DAY_MS; friday + 2 * DAY_MS <= last; friday += 7 * DAY_MS) {
    const sunday = friday + 2 * DAY_MS;
    const blocked = blackouts.some((range) => parse(range.start) <= sunday && parse(range.end) >= friday);
    if (!blocked) weekends.push(friday);
  }
  return weekends;
}

const PLAYOFF_WEEKENDS = 3;

export function buildLeagueSchedule(teams: ScheduleTeam[], startDate: string, endDate: string, blackouts: DateRange[] = []): ScheduleWeek[] {
  const rounds = roundRobinRounds(teams);
  const weekends = openWeekends(startDate, endDate, blackouts);
  const usable = weekends.slice(0, Math.max(rounds.length, weekends.length - PLAYOFF_WEEKENDS));
  const picks = rounds.map((_, index) => {
    const position = rounds.length === 1 ? 0 : Math.round((index * (usable.length - 1)) / (rounds.length - 1));
    return usable[position]!;
  });
  return rounds.map((matches, index) => {
    const friday = picks[index]!;
    const perDay = [Math.ceil(matches.length / 4), Math.ceil(matches.length / 2), 0];
    perDay[2] = matches.length - perDay[0]! - perDay[1]!;
    const weekdays = ["Fri", "Sat", "Sun"] as const;
    let cursor = 0;
    const days = weekdays.map((weekday, dayIndex) => {
      const slice = matches.slice(cursor, cursor + perDay[dayIndex]!);
      cursor += perDay[dayIndex]!;
      return { date: iso(friday + dayIndex * DAY_MS), weekday, matches: slice };
    }).filter((day) => day.matches.length);
    return { number: index + 1, start: iso(friday), end: iso(friday + 2 * DAY_MS), days };
  });
}
