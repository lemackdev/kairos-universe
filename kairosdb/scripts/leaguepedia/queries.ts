import { cargoQueryAll } from "./cargo";
import { ImportManifest } from "./manifest";

/**
 * One global joined Cargo query for every current player/staff tenure,
 * instead of one query per team or per player. Mirrors the modern
 * Tenures-based roster resolution Leaguepedia's own team-member module uses:
 *
 *   Ten.Player = PR.AllName
 *   PR.OverviewPage = P._pageName
 *   Ten.RosterChangeIdJoin = RCJ.RosterChangeId
 *
 * Filtered to Ten.IsCurrent = "1".
 */
export async function queryCurrentTenuresGlobal(manifest: ImportManifest) {
  return cargoQueryAll(
    "current-tenures-global",
    {
      tables: "Tenures=Ten,PlayerRedirects=PR,Players=P,RosterChanges=RCJ",
      joinOn:
        "Ten.Player=PR.AllName,PR.OverviewPage=P._pageName,Ten.RosterChangeIdJoin=RCJ.RosterChangeId",
      fields: [
        "P._pageName=PlayerPageName",
        "P.OverviewPage=PlayerOverviewPage",
        "P.Player=PlayerDisplayName",
        "P.ID=PlayerId",
        "P.Name=PlayerLegalName",
        "P.NameFull=PlayerFullName",
        "P.Country=PlayerCountry",
        "P.NationalityPrimary=PlayerNationalityPrimary",
        "P.Residency=PlayerResidency",
        "P.Birthdate=PlayerBirthdate",
        "P.IsSubstitute=PlayerIsSubstitute",
        "P.IsTrainee=PlayerIsTrainee",
        "RCJ.Roles=Roles",
        "RCJ.RolesIngame=RolesIngame",
        "RCJ.RolesStaff=RolesStaff",
        "RCJ.RoleModifier=RoleModifier",
        "RCJ.Status=Status",
        "Ten.Team=Team",
        "Ten.DateJoin=DateJoin",
        "Ten.DateLeave=DateLeave",
        "Ten.ContractEnd=ContractEnd",
        "Ten.IsCurrent=IsCurrent",
        "Ten.RosterChangeIdJoin=RosterChangeIdJoin",
      ].join(","),
      where: 'Ten.IsCurrent="1"',
      orderBy: "P._pageName,Ten.Team",
    },
    manifest,
  );
}

/** Full Teams table, excluding disbanded teams (the import policy excludes
 * disbanded teams with no current roster by default; a disbanded team can
 * never have a current tenure so this filter is a safe volume reduction). */
export async function queryTeams(manifest: ImportManifest) {
  return cargoQueryAll(
    "teams-active",
    {
      tables: "Teams",
      fields: [
        "Name",
        "OverviewPage",
        "Short",
        "Location",
        "TeamLocation",
        "Region",
        "OrganizationPage",
        "IsDisbanded",
        "RenamedTo",
      ].join(","),
      where: 'Teams.IsDisbanded="0" OR Teams.IsDisbanded IS NULL',
      orderBy: "Teams.OverviewPage",
    },
    manifest,
  );
}

/** Fallback current-roster source for teams that produce no rows from the
 * modern Tenures-based query. Fetched globally, not per-team, then filtered
 * client-side to only the teams that actually need the fallback. */
export async function queryListplayerCurrentGlobal(manifest: ImportManifest) {
  return cargoQueryAll(
    "listplayercurrent-global",
    {
      tables: "ListplayerCurrent",
      fields: [
        "ID",
        "Link",
        "Name",
        "N",
        "Country",
        "Role",
        "IsSubstitute",
        "IsTrainee",
        "Team",
        "ContractDate",
        "Residency",
      ].join(","),
      orderBy: "ListplayerCurrent.Team,ListplayerCurrent.N",
    },
    manifest,
  );
}
