import type { GroupStageMatch, GroupStageTeam } from "@/components/articles/GroupStage";
import type { BracketRound } from "@/components/articles/PlayoffBracket";

// The page pattern of IEM Dallas 2027 with every team still TBD: 16 teams play 4 groups of 4, 8 teams play 2 groups of 4;
// the two best of each group advance to a single-elimination bracket (Bo3 until the grand final, a Bo5).
export const patternTeamCounts = [8, 16] as const;

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
  const empty = (count: number) => Array.from({ length: count }, () => ({ teamA: null, teamB: null }));
  const rounds: BracketRound[] = [
    ...(teamsCount === 16 ? [{ name: "Quarter-finals", matchFormat: "Bo3", matches: empty(4) }] : []),
    { name: "Semi-finals", matchFormat: "Bo3", matches: empty(2) },
    { name: "Grand final", matchFormat: "Bo5", matches: empty(1) },
  ];
  return {
    groupStage: { format: `${groupCount} groups of 4`, advancing: 2, groups },
    playoffs: { title: "Playoffs", rounds },
  };
}
