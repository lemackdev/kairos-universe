import type { CanonicalRole } from "./types";

const ROLE_MAP: Record<string, CanonicalRole> = {
  top: "top",
  jungle: "jungle",
  jg: "jungle",
  mid: "mid",
  middle: "mid",
  bot: "bot",
  bottom: "bot",
  adc: "bot",
  support: "support",
  sup: "support",
};

/** Maps a raw Leaguepedia in-game role string to a controlled value. Unknown
 * or staff-shaped roles are preserved as "unknown" rather than forced into a
 * player position — callers should keep the raw string alongside this. */
export function mapInGameRole(raw: string | null | undefined): CanonicalRole {
  if (!raw) return "unknown";
  const normalized = ROLE_MAP[raw.trim().toLowerCase()];
  return normalized ?? "unknown";
}

export function splitRoles(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,/]/)
    .map((r) => r.trim())
    .filter(Boolean);
}

const COACHING_STAFF_ROLES = new Set(
  [
    "Head Coach",
    "Coach",
    "Assistant Coach",
    "Strategic Coach",
    "Positional Coach",
    "Analyst",
  ].map((r) => r.toLowerCase()),
);

const MANAGEMENT_STAFF_ROLES = new Set(
  [
    "Owner",
    "General Manager",
    "Manager",
    "Content Creator",
    "Streamer",
    "CEO",
    "President",
    "Executive",
  ].map((r) => r.toLowerCase()),
);

export function isCoachingStaffRole(raw: string): boolean {
  return COACHING_STAFF_ROLES.has(raw.trim().toLowerCase());
}

export function isManagementStaffRole(raw: string): boolean {
  return MANAGEMENT_STAFF_ROLES.has(raw.trim().toLowerCase());
}
