import type {
  LineupRecord,
  RosterTenure,
  StaffTenure,
} from "@/types/canon";

export function getTeamRosterAtDate(
  tenures: RosterTenure[],
  teamId: string,
  date: string,
): RosterTenure[] {
  return tenures
    .filter(
      (tenure) =>
        tenure.teamId === teamId &&
        tenure.rosterStatus === "active" &&
        isActiveAtDate(tenure.effectiveDate ?? tenure.joinedDate, tenure.leftDate, date),
    )
    .sort((a, b) => a.roleId.localeCompare(b.roleId));
}

export function getActiveRoster(
  tenures: RosterTenure[],
  teamId: string,
  narrativeDate: string,
): RosterTenure[] {
  return getTeamRosterAtDate(tenures, teamId, narrativeDate);
}

export function getPlayerTeamHistory(
  tenures: RosterTenure[],
  playerId: string,
): RosterTenure[] {
  return tenures
    .filter((tenure) => tenure.playerId === playerId)
    .sort((a, b) => sortableDate(a.effectiveDate).localeCompare(sortableDate(b.effectiveDate)));
}

export function getTeamStaffAtDate(
  tenures: StaffTenure[],
  teamId: string,
  divisionId: string,
  date: string,
): StaffTenure[] {
  return tenures.filter(
    (tenure) =>
      tenure.status === "active" &&
      (tenure.teamId === teamId ||
        (tenure.teamId === "TBD" && tenure.divisionId === divisionId)) &&
      isActiveAtDate(tenure.startedDate, tenure.endedDate, date),
  );
}

export function getMatchLineup(
  lineups: LineupRecord[],
  matchId: string,
  teamId: string,
): LineupRecord | null {
  return (
    lineups.find(
      (lineup) => lineup.matchId === matchId && lineup.teamId === teamId,
    ) ?? null
  );
}

function isActiveAtDate(
  start: string | null,
  end: string | null,
  date: string,
): boolean {
  const startsBefore = !isExactDate(start) || start <= date;
  const endsAfter = !isExactDate(end) || end >= date;
  return startsBefore && endsAfter;
}

function isExactDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function sortableDate(value: string | null): string {
  return isExactDate(value) ? value : "9999-12-31";
}
