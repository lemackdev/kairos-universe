import {
  IMPORTER_VERSION,
  SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
  SNAPSHOT_ID,
  SNAPSHOT_NEXT_REVIEW_PERIOD,
} from "./config";
import { sha256 } from "./cache";
import { buildStableId, createSlugRegistry, reserveSlug, slugify } from "./ids";
import { isCoachingStaffRole, isManagementStaffRole, mapInGameRole, splitRoles } from "./roles";
import type {
  AliasRecord,
  NormalizedOrganization,
  NormalizedPlayer,
  NormalizedRosterTenure,
  NormalizedStaff,
  NormalizedStaffTenure,
  NormalizedTeam,
  ReviewStatus,
} from "./types";
import type { PageRevisionInfo } from "./mediawiki";

export interface ImportPolicy {
  includeSubstitutes: boolean;
  includeTrainees: boolean;
  includeInactiveRosterMembers: boolean;
  includeCoachingStaff: boolean;
  includeManagementStaff: boolean;
  includeDisbandedTeams: boolean;
}

export interface FictionalCanonIdentities {
  playerSlugs: Set<string>;
  playerNicknames: Set<string>;
  teamSlugs: Set<string>;
}

export interface NormalizeReport {
  ambiguous: string[];
  duplicates: string[];
  missingFields: string[];
  warnings: string[];
}

export interface NormalizeInput {
  teams: Array<Record<string, string>>;
  tenures: Array<Record<string, string>>;
  fallback: Array<Record<string, string>>;
  revisionsByTitle: Map<string, PageRevisionInfo>;
  policy: ImportPolicy;
  fictional: FictionalCanonIdentities;
  now?: string;
}

export interface NormalizeResult {
  organizations: NormalizedOrganization[];
  teams: NormalizedTeam[];
  players: NormalizedPlayer[];
  staff: NormalizedStaff[];
  rosterTenures: NormalizedRosterTenure[];
  staffTenures: NormalizedStaffTenure[];
  aliases: AliasRecord[];
  report: NormalizeReport;
}

function truthyCargoBoolean(raw: string | undefined): boolean {
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

function nonEmpty(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Pure normalization core: turns raw Cargo rows into normalized entity
 * records. Takes no dependency on the filesystem or network, so it can run
 * against fixture data in tests. `normalize.ts` is the thin script wrapper
 * that fetches the raw rows (network/cache) and writes this function's
 * output to disk.
 */
export function buildNormalizedSnapshot(input: NormalizeInput): NormalizeResult {
  const { teams, tenures, fallback, revisionsByTitle, policy, fictional } = input;
  const now = input.now ?? new Date().toISOString();
  const retrievedAt = now;

  const report: NormalizeReport = {
    ambiguous: [],
    duplicates: [],
    missingFields: [],
    warnings: [],
  };

  function sourceRecordFor(title: string | null): { id: string; ref: string[] } {
    if (!title) return { id: "", ref: [] };
    const rev = revisionsByTitle.get(title);
    const id = `leaguepedia-page-${slugify(title)}-revision-${rev?.revisionId ?? "unknown"}`;
    if (!rev || rev.revisionId === null) {
      report.missingFields.push(`No source revision resolved for page "${title}".`);
    }
    return { id, ref: [id] };
  }

  // --- Teams and organizations ---------------------------------------
  const teamsByOverviewPage = new Map(teams.map((t) => [t.OverviewPage, t] as const));
  const teamsWithModernTenures = new Set(tenures.map((r) => r.Team).filter(isString));
  const teamsWithFallback = new Set(fallback.map((r) => r.Team).filter(isString));

  const slugRegistry = createSlugRegistry();
  const orgsByPage = new Map<string, NormalizedOrganization>();
  const normalizedTeams = new Map<string, NormalizedTeam>();
  const teamOverviewPageToId = new Map<string, string>();

  const includedTeamPages = new Set<string>(
    [...teamsWithModernTenures, ...teamsWithFallback].filter((page) =>
      teamsByOverviewPage.has(page),
    ),
  );

  for (const fallbackTeamPage of teamsWithFallback) {
    if (!teamsByOverviewPage.has(fallbackTeamPage)) {
      report.ambiguous.push(
        `Team "${fallbackTeamPage}" has a ListplayerCurrent fallback roster but no matching Teams table row; skipped.`,
      );
    }
  }

  for (const teamPage of includedTeamPages) {
    const row = teamsByOverviewPage.get(teamPage);
    if (!row) continue;

    const isDisbanded = truthyCargoBoolean(row.IsDisbanded);
    if (isDisbanded && !policy.includeDisbandedTeams) {
      report.warnings.push(
        `Team "${teamPage}" is marked disbanded and was excluded despite having roster rows (data inconsistency worth checking upstream).`,
      );
      continue;
    }

    const teamId = buildStableId("team", teamPage);
    const desiredSlug = slugify(row.Short || row.Name || teamPage);
    const slug = reserveSlug(slugRegistry, "team", desiredSlug, teamId, teamPage);

    let organizationId: string | null = null;
    const orgPage = nonEmpty(row.OrganizationPage);
    if (orgPage) {
      if (!orgsByPage.has(orgPage)) {
        const orgId = buildStableId("organization", orgPage);
        const orgSlug = reserveSlug(slugRegistry, "organization", slugify(orgPage), orgId, orgPage);
        const orgSource = sourceRecordFor(orgPage);
        orgsByPage.set(orgPage, {
          id: orgId,
          slug: orgSlug,
          name: orgPage,
          shortName: nonEmpty(row.Short),
          originType: "real-world-reference",
          continuityId: "kairos-universe",
          sourceOrganizationPage: orgPage,
          status: "active",
          location: nonEmpty(row.Location),
          region: nonEmpty(row.Region),
          teamIds: [],
          sourceSnapshotId: SNAPSHOT_ID,
          importerVersion: IMPORTER_VERSION,
          rawRecordChecksum: sha256(JSON.stringify(row)),
          retrievedAt,
          reviewStatus: "imported" as ReviewStatus,
          reviewNotes: [],
          sources: orgSource.ref,
        });
      }
      const org = orgsByPage.get(orgPage);
      if (org) {
        org.teamIds.push(teamId);
        organizationId = org.id;
      }
    }

    if (fictional.teamSlugs.has(slug) || fictional.teamSlugs.has(teamId)) {
      report.ambiguous.push(
        `External team "${teamPage}" produced a slug ("${slug}") colliding with a fictional Kairos team; kept under its namespaced ID only and marked needs-review.`,
      );
    }

    const teamSource = sourceRecordFor(teamPage);
    normalizedTeams.set(teamId, {
      id: teamId,
      slug,
      name: row.Name || teamPage,
      shortName: nonEmpty(row.Short),
      gameId: "league-of-legends",
      organizationId,
      originType: "real-world-reference",
      continuityId: "kairos-universe",
      leaguepediaOverviewPage: teamPage,
      region: nonEmpty(row.Region),
      location: nonEmpty(row.TeamLocation) ?? nonEmpty(row.Location),
      status: "active",
      isDisbanded,
      currentPlayerTenureIds: [],
      currentStaffTenureIds: [],
      sourceSnapshotId: SNAPSHOT_ID,
      importerVersion: IMPORTER_VERSION,
      rawRecordChecksum: sha256(JSON.stringify(row)),
      retrievedAt,
      reviewStatus: "imported",
      reviewNotes: [],
      sources: teamSource.ref,
    });
    teamOverviewPageToId.set(teamPage, teamId);
  }

  // --- Players and staff from the modern Tenures-based query ----------
  const normalizedPlayers = new Map<string, NormalizedPlayer>();
  const normalizedStaff = new Map<string, NormalizedStaff>();
  const rosterTenures: NormalizedRosterTenure[] = [];
  const staffTenures: NormalizedStaffTenure[] = [];
  const aliases: AliasRecord[] = [];

  // Pre-pass: compute each person's *final* set of current teams across all
  // rows before deciding review status, so a contradictory multi-team
  // person is flagged on every one of their tenure rows — not just the ones
  // processed after the second team was seen.
  const personFinalTeams = new Map<string, Set<string>>();
  for (const row of tenures) {
    const teamId = teamOverviewPageToId.get(row.Team ?? "");
    if (!teamId) continue;
    const personPage = nonEmpty(row.PlayerOverviewPage) ?? nonEmpty(row.PlayerPageName);
    if (!personPage) continue;
    const set = personFinalTeams.get(personPage) ?? new Set<string>();
    set.add(teamId);
    personFinalTeams.set(personPage, set);
  }
  const reportedDuplicates = new Set<string>();

  for (const row of tenures) {
    const teamId = teamOverviewPageToId.get(row.Team ?? "");
    if (!teamId) continue;

    const personPage = nonEmpty(row.PlayerOverviewPage) ?? nonEmpty(row.PlayerPageName);
    if (!personPage) {
      report.missingFields.push(
        `Tenure row for team "${row.Team}" has no resolvable player page identity; skipped.`,
      );
      continue;
    }

    const nickname = row.PlayerDisplayName || row.PlayerId || personPage;
    const rolesIngame = splitRoles(row.RolesIngame);
    const rolesStaff = splitRoles(row.RolesStaff);
    const isSub = truthyCargoBoolean(row.PlayerIsSubstitute);
    const isTrainee = truthyCargoBoolean(row.PlayerIsTrainee);

    if (isSub && !policy.includeSubstitutes) continue;
    if (isTrainee && !policy.includeTrainees) continue;

    const seenTeams = personFinalTeams.get(personPage) ?? new Set<string>([teamId]);
    if (seenTeams.size > 1 && !reportedDuplicates.has(personPage)) {
      reportedDuplicates.add(personPage);
      report.duplicates.push(
        `Player/staff page "${personPage}" has current tenures on multiple teams: ${Array.from(seenTeams).join(", ")}.`,
      );
    }

    const personSource = sourceRecordFor(personPage);
    const rawChecksum = sha256(JSON.stringify(row));

    if (rolesIngame.length > 0) {
      const playerId = buildStableId("player", personPage);
      const desiredSlug = slugify(nickname);
      const slug = reserveSlug(slugRegistry, "player", desiredSlug, playerId, personPage);

      const nicknameCollision = fictional.playerNicknames.has(nickname.toLowerCase());
      if (nicknameCollision) {
        report.ambiguous.push(
          `External player "${nickname}" (${personPage}) shares a nickname with a fictional Kairos player; kept fully separate under "${playerId}" and marked needs-review.`,
        );
      }

      if (!normalizedPlayers.has(playerId)) {
        normalizedPlayers.set(playerId, {
          id: playerId,
          slug,
          nickname,
          legalName: nonEmpty(row.PlayerLegalName),
          fullName: nonEmpty(row.PlayerFullName),
          countryOfBirth: nonEmpty(row.PlayerCountry),
          nationalities: nonEmpty(row.PlayerNationalityPrimary)
            ? [nonEmpty(row.PlayerNationalityPrimary) as string]
            : [],
          residency: nonEmpty(row.PlayerResidency),
          dateOfBirth: nonEmpty(row.PlayerBirthdate),
          primaryRole: mapInGameRole(rolesIngame[0]),
          currentTeamId: teamId,
          originType: "real-world-reference",
          continuityId: "kairos-universe",
          leaguepediaPage: personPage,
          aliases: [],
          sourceSnapshotId: SNAPSHOT_ID,
          importerVersion: IMPORTER_VERSION,
          rawRecordChecksum: rawChecksum,
          retrievedAt,
          reviewStatus: nicknameCollision || seenTeams.size > 1 ? "needs-review" : "imported",
          reviewNotes: nicknameCollision
            ? ["Nickname collision with a fictional Kairos player."]
            : [],
          sources: personSource.ref,
        });
      }

      const tenureId = `external-tenure-${slugify(personPage)}-${slugify(row.Team ?? "")}-${SNAPSHOT_ID}`;
      rosterTenures.push({
        id: tenureId,
        playerId,
        teamId,
        gameId: "league-of-legends",
        roles: rolesIngame.map(mapInGameRole),
        rawRoles: rolesIngame,
        rosterStatus: "active",
        isStarter: !isSub && !isTrainee,
        isSubstitute: isSub,
        isTrainee,
        isInactive: false,
        joinedDate: nonEmpty(row.DateJoin),
        joinedDatePrecision: nonEmpty(row.DateJoin) ? "day" : "unknown",
        leftDate: nonEmpty(row.DateLeave),
        isCurrentAtSnapshot: true,
        snapshotId: SNAPSHOT_ID,
        effectiveUniversePeriod: SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
        frozenUntilPeriod: SNAPSHOT_NEXT_REVIEW_PERIOD,
        sourceSnapshotId: SNAPSHOT_ID,
        importerVersion: IMPORTER_VERSION,
        rawRecordChecksum: rawChecksum,
        retrievedAt,
        reviewStatus: seenTeams.size > 1 ? "needs-review" : "imported",
        reviewNotes: seenTeams.size > 1 ? ["Player has more than one current-team tenure."] : [],
        sources: personSource.ref,
      });

      const team = normalizedTeams.get(teamId);
      if (team) team.currentPlayerTenureIds.push(tenureId);
    }

    if (rolesStaff.length > 0 && policy.includeCoachingStaff) {
      const eligibleRoles = rolesStaff.filter(
        (r) => isCoachingStaffRole(r) || (policy.includeManagementStaff && isManagementStaffRole(r)),
      );
      if (eligibleRoles.length === 0) continue;

      const staffId = buildStableId("staff", personPage);
      const desiredSlug = slugify(nickname);
      const slug = reserveSlug(slugRegistry, "staff", desiredSlug, staffId, personPage);
      const linkedPlayerId = rolesIngame.length > 0 ? buildStableId("player", personPage) : null;

      if (!normalizedStaff.has(staffId)) {
        normalizedStaff.set(staffId, {
          id: staffId,
          slug,
          nickname,
          legalName: nonEmpty(row.PlayerLegalName),
          fullName: nonEmpty(row.PlayerFullName),
          countryOfBirth: nonEmpty(row.PlayerCountry),
          nationalities: nonEmpty(row.PlayerNationalityPrimary)
            ? [nonEmpty(row.PlayerNationalityPrimary) as string]
            : [],
          residency: nonEmpty(row.PlayerResidency),
          currentTeamId: teamId,
          originType: "real-world-reference",
          continuityId: "kairos-universe",
          leaguepediaPage: personPage,
          aliases: [],
          linkedPlayerId,
          sourceSnapshotId: SNAPSHOT_ID,
          importerVersion: IMPORTER_VERSION,
          rawRecordChecksum: rawChecksum,
          retrievedAt,
          reviewStatus: "imported",
          reviewNotes: [],
          sources: personSource.ref,
        });
      }

      for (const role of eligibleRoles) {
        const tenureId = `external-staff-tenure-${slugify(personPage)}-${slugify(row.Team ?? "")}-${slugify(role)}-${SNAPSHOT_ID}`;
        staffTenures.push({
          id: tenureId,
          staffId,
          teamId,
          gameId: "league-of-legends",
          role,
          rosterStatus: "active",
          joinedDate: nonEmpty(row.DateJoin),
          joinedDatePrecision: nonEmpty(row.DateJoin) ? "day" : "unknown",
          leftDate: nonEmpty(row.DateLeave),
          isCurrentAtSnapshot: true,
          snapshotId: SNAPSHOT_ID,
          effectiveUniversePeriod: SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
          frozenUntilPeriod: SNAPSHOT_NEXT_REVIEW_PERIOD,
          sourceSnapshotId: SNAPSHOT_ID,
          importerVersion: IMPORTER_VERSION,
          rawRecordChecksum: rawChecksum,
          retrievedAt,
          reviewStatus: "imported",
          reviewNotes: [],
          sources: personSource.ref,
        });
        const team = normalizedTeams.get(teamId);
        if (team) team.currentStaffTenureIds.push(tenureId);
      }
    }
  }

  // --- Fallback ListplayerCurrent rows, only for teams without modern rows
  for (const row of fallback) {
    const teamId = teamOverviewPageToId.get(row.Team ?? "");
    if (!teamId) continue;
    if (teamsWithModernTenures.has(row.Team ?? "")) continue;

    const personPage = nonEmpty(row.Link) ?? nonEmpty(row.Name);
    if (!personPage) continue;

    const nickname = row.Name || row.ID || personPage;
    const isSub = truthyCargoBoolean(row.IsSubstitute);
    const isTrainee = truthyCargoBoolean(row.IsTrainee);
    if (isSub && !policy.includeSubstitutes) continue;
    if (isTrainee && !policy.includeTrainees) continue;

    const playerId = buildStableId("player", personPage);
    const desiredSlug = slugify(nickname);
    const slug = reserveSlug(slugRegistry, "player", desiredSlug, playerId, personPage);
    const personSource = sourceRecordFor(personPage);
    const rawChecksum = sha256(JSON.stringify(row));
    const nicknameCollision = fictional.playerNicknames.has(nickname.toLowerCase());

    if (!normalizedPlayers.has(playerId)) {
      normalizedPlayers.set(playerId, {
        id: playerId,
        slug,
        nickname,
        legalName: null,
        fullName: null,
        countryOfBirth: nonEmpty(row.Country),
        nationalities: [],
        residency: nonEmpty(row.Residency),
        dateOfBirth: null,
        primaryRole: mapInGameRole(row.Role),
        currentTeamId: teamId,
        originType: "real-world-reference",
        continuityId: "kairos-universe",
        leaguepediaPage: personPage,
        aliases: [],
        sourceSnapshotId: SNAPSHOT_ID,
        importerVersion: IMPORTER_VERSION,
        rawRecordChecksum: rawChecksum,
        retrievedAt,
        reviewStatus: "needs-review",
        reviewNotes: [
          "Sourced from the ListplayerCurrent fallback table, not the modern Tenures system; fields are less complete.",
          ...(nicknameCollision ? ["Nickname collision with a fictional Kairos player."] : []),
        ],
        sources: personSource.ref,
      });
    }

    const tenureId = `external-tenure-fallback-${slugify(personPage)}-${slugify(row.Team ?? "")}-${SNAPSHOT_ID}`;
    rosterTenures.push({
      id: tenureId,
      playerId,
      teamId,
      gameId: "league-of-legends",
      roles: [mapInGameRole(row.Role)],
      rawRoles: row.Role ? [row.Role] : [],
      rosterStatus: "active",
      isStarter: !isSub && !isTrainee,
      isSubstitute: isSub,
      isTrainee,
      isInactive: false,
      joinedDate: nonEmpty(row.ContractDate),
      joinedDatePrecision: nonEmpty(row.ContractDate) ? "day" : "unknown",
      leftDate: null,
      isCurrentAtSnapshot: true,
      snapshotId: SNAPSHOT_ID,
      effectiveUniversePeriod: SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD,
      frozenUntilPeriod: SNAPSHOT_NEXT_REVIEW_PERIOD,
      sourceSnapshotId: SNAPSHOT_ID,
      importerVersion: IMPORTER_VERSION,
      rawRecordChecksum: rawChecksum,
      retrievedAt,
      reviewStatus: "needs-review",
      reviewNotes: ["Fallback-sourced tenure (ListplayerCurrent)."],
      sources: personSource.ref,
    });
    const team = normalizedTeams.get(teamId);
    if (team) team.currentPlayerTenureIds.push(tenureId);
  }

  return {
    organizations: [...orgsByPage.values()],
    teams: [...normalizedTeams.values()],
    players: [...normalizedPlayers.values()],
    staff: [...normalizedStaff.values()],
    rosterTenures,
    staffTenures,
    aliases,
    report,
  };
}
