import path from "node:path";

import { readJson } from "./json";
import { kairosDataRoot } from "./paths";

export interface KairosOriginalPlayer {
  id: string;
  slug: string;
  realName: string;
  nickname: string;
  nationality: string;
  city: string;
  dateOfBirth: string;
  game: string;
  role: string;
  currentTeam: string;
  rosterLevel: string;
  status: string;
  isCaptain: boolean;
}

export interface KairosOriginalTeam {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  organization: { id: string; name: string };
  game: string;
  level: string;
  status: string;
  roster: string[];
  coachingStaff: string[];
  captain: string;
}

/** The five published Kairos League of Legends players. KairosDB reads
 * these directly from canonical repository data — it never imports them
 * from Leaguepedia and never duplicates them as external records. */
const KAIROS_LEAGUE_PLAYER_SLUGS = [
  "noah-rkn-bennett",
  "ethan-vanta-walker",
  "mason-404-brooks",
  "liam-aster-oconnor",
  "daniel-moss-reyes",
] as const;

// The team's repository filename ("kairos-league-of-legends.json") differs
// from its canonical `slug` field ("kairos-lol-main") — always compare
// against the loaded record's own .slug, not this filename constant.
const KAIROS_LEAGUE_TEAM_FILENAME = "kairos-league-of-legends";

export function loadKairosLeaguePlayers(): KairosOriginalPlayer[] {
  return KAIROS_LEAGUE_PLAYER_SLUGS.map((slug) =>
    readJson<KairosOriginalPlayer>(
      path.join(kairosDataRoot, "players", `${slug}.json`),
    ),
  );
}

export function loadKairosLeagueTeam(): KairosOriginalTeam {
  return readJson<KairosOriginalTeam>(
    path.join(kairosDataRoot, "teams", `${KAIROS_LEAGUE_TEAM_FILENAME}.json`),
  );
}

export function isKairosOriginalPlayerSlug(slug: string): boolean {
  return (KAIROS_LEAGUE_PLAYER_SLUGS as readonly string[]).includes(slug);
}
