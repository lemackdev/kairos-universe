/**
 * Cross-product links between Kairospedia and KairosDB. Both are
 * independent Next.js apps with no decided joint deployment yet, so the base
 * URL is env-configurable and defaults to a same-origin relative path.
 */
const KAIROSDB_BASE_URL = process.env.NEXT_PUBLIC_KAIROSDB_BASE_URL ?? "";

const KAIROS_LEAGUE_PLAYER_SLUGS = new Set([
  "noah-rkn-bennett",
  "ethan-vanta-walker",
  "mason-404-brooks",
  "liam-aster-oconnor",
  "daniel-moss-reyes",
]);

const KAIROS_LEAGUE_TEAM_ID = "kairos-lol-main";

export function hasKairosDbProfile(kind: "player" | "team", slugOrId: string): boolean {
  if (kind === "player") return KAIROS_LEAGUE_PLAYER_SLUGS.has(slugOrId);
  return slugOrId === KAIROS_LEAGUE_TEAM_ID;
}

export function kairosDbPlayerUrl(slug: string): string {
  return `${KAIROSDB_BASE_URL}/players/${slug}`;
}

export function kairosDbTeamUrl(slug: string): string {
  return `${KAIROSDB_BASE_URL}/teams/${slug}`;
}
