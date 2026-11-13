import type { GroupStageMatch, GroupStageTeam } from "@/components/articles/GroupStage";
import type { BracketRound } from "@/components/articles/PlayoffBracket";

// The page pattern of IEM Dallas 2027 with every team still TBD: 16 teams play 4 groups of 4, 8 teams play 2 groups of 4;
// the two best of each group advance to a single-elimination bracket (Bo3 until the grand final, a Bo5).
export const patternTeamCounts = [8, 16] as const;

// Seeding rule of the 16-team playoffs (4 groups of 4): the eight advancing teams are seeded from the group-stage results (group winners
// first, then runners-up; inside each tier by wins, round difference and name) and the quarter-finals are always 1-8, 2-7, 3-6, 4-5.
// They are listed 1-8, 4-5, 2-7, 3-6 so that 1-8 meets 4-5 and 2-7 meets 3-6 in the semi-finals.
export const quarterFinalSeedPairs: Array<[number, number]> = [[1, 8], [4, 5], [2, 7], [3, 6]];

export interface SeedingRow { teamId: string; name: string; wins: number; roundDiff: number }

// Returns the team ids ordered by seed (index 0 is seed 1), or null while the group stage is not complete.
export function seedAdvancingTeams(groups: Array<{ rows: SeedingRow[]; complete: boolean }>, advancing: number): string[] | null {
  if (groups.length === 0 || groups.some((group) => !group.complete)) return null;
  const entries = groups.flatMap((group) => group.rows.slice(0, advancing).map((row, position) => ({ ...row, position })));
  entries.sort((a, b) => a.position - b.position || b.wins - a.wins || b.roundDiff - a.roundDiff || a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  return entries.map((entry) => entry.teamId);
}

const roundPairs: Array<[number, number, number]> = [[0, 1, 1], [2, 3, 1], [1, 2, 2], [3, 0, 2], [0, 2, 3], [1, 3, 3]];

export function buildTbdPattern(teamsCount: number) {
  const groupCount = teamsCount / 4;
  const letters = "ABCD".slice(0, groupCount).split("");
  const groups = letters.map((letter) => {
    const teams: GroupStageTeam[] = [0, 1, 2, 3].map((slot) => ({ key: `tbd-${letter}-${slot}`, name: "TBD", href: null, tbd: true }));
    const matches: GroupStageMatch[] = roundPairs.map(([a, b, round]) => ({
      key: `tbd-${letter}-${a}-${b}`, round, teamA: teams[a]!, teamB: teams[b]!, format: "Bo3", mapsA: null, mapsB: null,
    }));
    return { name: `Group ${letter}`, teams, matches };
  });
  const empty = (count: number): BracketRound["matches"] => Array.from({ length: count }, () => ({ teamA: null, teamB: null }));
  const seeded = (matches: BracketRound["matches"]) => matches.map((match, index) => ({ ...match, seedA: quarterFinalSeedPairs[index]![0], seedB: quarterFinalSeedPairs[index]![1] }));
  const rounds: BracketRound[] = [
    ...(teamsCount === 16 ? [{ name: "Quarter-finals", matchFormat: "Bo3", matches: seeded(empty(4)) }] : []),
    { name: "Semi-finals", matchFormat: "Bo3", matches: empty(2) },
    { name: "Grand final", matchFormat: "Bo5", matches: empty(1) },
  ];
  return {
    groupStage: { format: `${groupCount} groups of 4`, advancing: 2, groups },
    playoffs: { title: "Playoffs", rounds },
  };
}
