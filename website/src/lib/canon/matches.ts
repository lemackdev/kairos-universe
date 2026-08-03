import type { MatchRecord } from "@/types/canon";

export function getOfficialMatches(matches: MatchRecord[]): MatchRecord[] {
  return matches.filter(
    (match) =>
      match.matchType === "official-match" &&
      match.visibility === "public" &&
      match.officialStatus === "official",
  );
}

export function getPrivatePractice(matches: MatchRecord[]): MatchRecord[] {
  return matches.filter(
    (match) =>
      match.visibility !== "public" || match.officialStatus === "practice",
  );
}
