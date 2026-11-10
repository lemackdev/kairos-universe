import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleInfobox, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";
import { RealWorldTeamsTable } from "./RealWorldTeamsTable";
import { externalLogoPath } from "@/lib/externalLogos";
import { ExternalRosterTable } from "@/components/ExternalRosterTable";
import { TeamRosterTable } from "@/components/TeamRosterTable";
import { LocationValue } from "@/components/LocationValue";
import { CsRoleIcons } from "@/components/CsRoleIcons";
import type { RosterEntryView } from "@/types/catalog";
import { formatDate } from "@/lib/formatting/date";
import type { ExternalScene, SceneOrganization, ScenePlayer, SceneTeam } from "@/types/external-scene";
import type { AddedPlayer2027, CsOrganization2027, CsPlayer2027, CsTeam2027, WorldState2027 } from "@/types/world-state-2027";
import { csTeamsOfOrganization, findCsAssignment, findFreeAgent, findLcsAssignment, findMarketAvailability, csRoleOf, findRetirement, legalNameOf, listAllTier2Teams, nationalitiesOf, organizationOverviewOf, teamLocationOf, rosterSets, type Tier2TeamLookup } from "@/lib/external/worldState2027";
const roleLabels = { top: "Top", jungle: "Jungle", mid: "Mid", bot: "Bot / ADC", support: "Support" };


export function ExternalSources({ scene, ids }: { scene: ExternalScene; ids: string[] }) {
  return <ul>{scene.sources.filter((s) => ids.includes(s.id)).map((s) => <li key={s.id}>
    <a href={s.url} rel="noreferrer">{s.title}</a>. Event ended {formatDate(s.eventEndDate)}. Researched {formatDate(s.retrievedDate)} from indexed tournament-page excerpts. Exact revision unavailable.
  </li>)}</ul>;
}

export function ExternalTeamArticle({ team, scene }: { team: SceneTeam; scene: ExternalScene }) {
  const organization = scene.organizations.find((o) => o.id === team.organizationId)!;
  const members = team.rosterTenureIds.map((id) => scene.rosterTenures.find((t) => t.id === id)!);
  const event = scene.sources.find((s) => team.sourceIds.includes(s.id))!;
  const sections = ["History", "Team Information", "Timeline", "Player Roster", "Former", "Organization", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  const logo = externalLogoPath(organization.slug);
  return <WikiArticle title={team.name} kind="Teams" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={team.name} monogram={team.name.slice(0, 2)}
    image={logo && <img src={logo} alt={`${team.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />} groups={[
    { title: "Team Information", rows: [{ label: "League", value: team.league },
      { label: "Roster basis", value: event.title }, { label: "Event ended", value: formatDate(event.eventEndDate) },
      { label: "Review status", value: "Needs review" }, { label: "Current contracts", value: "Unknown" }] },
  ]} />}>
    <ArticleSection id="history" title="History"><p>This reference records the {event.title} roster. Earlier team history and later transactions have not been imported.</p></ArticleSection>
    <ArticleSection id="team-information" title="Team Information"><p>{team.name} is included in the {team.league} reference collection. {team.basis === "last-available-domestic-tournament" ? "This is an older fallback: the team did not participate in LPL Split 3. It must not be presented as a current roster." : "The roster is based on the last applicable domestic championship in this research cycle."}</p>
      {team.notes.length > 0 && <ul>{team.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
    </ArticleSection>
    <ArticleSection id="timeline" title="Timeline"><p>{formatDate(event.eventEndDate)}: referenced tournament ended. This is not a signing date, departure date, or Kairos story event.</p></ArticleSection>
    <ArticleSection id="player-roster" title="Player Roster"><ExternalRosterTable caption={`${event.title}: listed players`} rows={members.map((tenure) => {
      const player = scene.players.find((p) => p.id === tenure.playerId)!;
      return { id: tenure.id, role: tenure.role, roleLabel: roleLabels[tenure.role], nickname: player.nickname, slug: player.slug, designation: tenure.designation };
    })} /><p className="muted">Multiple main entries in one role are retained as listed. No preferred starter is inferred.</p></ArticleSection>
    <ArticleSection id="former" title="Former"><p>Departure history is not imported. Absence from a later tournament list is not evidence of a release.</p></ArticleSection>
    <ArticleSection id="organization" title="Organization"><p><Link href={`/wiki/organizations/${organization.slug}`}>{organization.name}</Link>, esports brand reference. Legal ownership, leadership, staff appointments and corporate structure remain unknown.</p></ArticleSection>
    <ArticleSection id="sources" title="Sources"><details><summary>Sources</summary><ExternalSources scene={scene} ids={team.sourceIds} /></details></ArticleSection>
  </WikiArticle>;
}

export function ExternalPlayerArticle({ player, scene, worldState }: { player: ScenePlayer; scene: ExternalScene; worldState?: WorldState2027 }) {
  const tenures = scene.rosterTenures.filter((t) => player.rosterTenureIds.includes(t.id)).sort((a, b) => a.observedAtEventEnd.localeCompare(b.observedAtEventEnd));
  const sections = ["Overview", "Background Information", "Team History", "Trivia", "Individual Awards", "Tournament Results", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  const freeAgent = findFreeAgent(worldState, player.id);
  const assignment = findLcsAssignment(worldState, player.id);
  const retirement = findRetirement(worldState, player.id);
  const market = findMarketAvailability(worldState, player.id);
  const supersededTenures = rosterSets(worldState).flatMap((set) => set.departures).filter((entry) => entry.playerId === player.id);
  const previousTeam = freeAgent ? scene.teams.find((t) => t.id === freeAgent.previousTeamId) : null;
  const league = assignment?.league ?? scene.teams.find((t) => t.id === tenures[tenures.length - 1]?.teamId)?.league ?? "";
  const nationalities = nationalitiesOf(worldState, player.id, league);
  return <WikiArticle title={player.nickname} kind="Players" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Legal name", value: "Unknown" },
      { label: "Nationality", value: nationalities.length ? nationalities.join(", ") : "Unknown" }] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.teamId.replace(/^external-lol-team-/, "external-")}`}>{assignment.team.name}</Link> },
      { label: "Role", value: roleLabels[assignment.starter.role] },
    ] }] : []),
    ...(retirement ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Retired" },
      { label: "Last team", value: retirement.previousTeamName ?? "Not established" },
      { label: "Last role", value: retirement.previousRole ? roleLabels[retirement.previousRole] : "Not established" },
    ] }] : []),
    ...(market ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: `Available for the ${marketRegionLabel(market.eligibleRegion)} market` },
      { label: "Eligible region", value: market.eligibleRegion },
      { label: "Previous team", value: market.previousTeamName },
      { label: "Destination", value: "Not assigned (author-controlled)" },
    ] }] : []),
    ...(freeAgent ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Free Agent" },
      { label: "Previous team", value: previousTeam ? <Link href={`/wiki/teams/${previousTeam.slug}`}>{freeAgent.previousTeamName}</Link> : freeAgent.previousTeamName },
      { label: "Effective", value: formatDate(freeAgent.effectiveDate) },
    ] }] : []),
  ]} />}>
    <ArticleSection id="overview" title="Overview"><p>{player.nickname} appears in the source tournament roster lists below. This page does not assert a current club, age, or full career history.</p></ArticleSection>
    <ArticleSection id="background-information" title="Background Information"><p>Personal biography, nationality, residence, date of birth, contract details and captaincy have not been researched in this import.</p></ArticleSection>
    <ArticleSection id="team-history" title="Team History"><WikiTable caption="Observed tournament memberships, not dated contracts" columns={["Team", "League", "Role", "Listing", "Tournament ended"]} rows={[...tenures.map((tenure) => {
      const team = scene.teams.find((t) => t.id === tenure.teamId)!;
      const superseded = supersededTenures.some((entry) => entry.tenureId === tenure.id);
      return { key: tenure.id, cells: [<Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, team.league, roleLabels[tenure.role], superseded ? `${tenure.designation} (2026, superseded)` : tenure.designation, formatDate(tenure.observedAtEventEnd)] };
    }),
    ...(assignment ? [{ key: "2027", cells: [<Link key="team" href={`/wiki/teams/${assignment.team.teamId.replace(/^external-lol-team-/, "external-")}`}>{assignment.team.name}</Link>, assignment.league, roleLabels[assignment.starter.role], "2027 starter", formatDate(assignment.rosters.confirmedBy)] }] : []),
    ...(retirement ? [{ key: "2027-retired", cells: ["Retired", "—", retirement.previousRole ? roleLabels[retirement.previousRole] : "—", "2027 status", formatDate(retirement.rosters.confirmedBy)] }] : []),
    ...(market ? [{ key: "2027-market", cells: [`Available for the ${marketRegionLabel(market.eligibleRegion)} market`, market.targetLeague, roleLabels[market.previousRole], "2027 status", formatDate(market.rosters.confirmedBy)] }] : [])]} empty="No source-backed history imported." /></ArticleSection>
    <ArticleSection id="trivia" title="Trivia"><p>No trivia imported.</p></ArticleSection>
    <ArticleSection id="individual-awards" title="Individual Awards"><p>Awards have not been imported. This does not mean the player has none.</p></ArticleSection>
    <ArticleSection id="tournament-results" title="Tournament Results"><p>Results and statistics have not been imported. Roster membership alone does not establish games played or placement.</p></ArticleSection>
    <ArticleSection id="sources" title="Sources"><details><summary>Sources</summary><ExternalSources scene={scene} ids={player.sourceIds} /></details></ArticleSection>
  </WikiArticle>;
}

export function ExternalOrganizationArticle({ organization, scene, worldState }: { organization: SceneOrganization; scene: ExternalScene; worldState?: WorldState2027 }) {
  const logo = externalLogoPath(organization.slug);
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "organization-information", title: "Organization Information" },
    { id: "teams", title: "Teams" },
    { id: "sources", title: "Sources" },
  ];
  const teams = scene.teams.filter((team) => organization.teamIds.includes(team.id));
  const csTeams = csTeamsOfOrganization(worldState, organization.id);
  const academyTeams = listAllTier2Teams(worldState).filter((entry) => entry.parentTeamId && organization.teamIds.includes(entry.parentTeamId));
  return <WikiArticle title={organization.name} kind="Organizations" game="Real-world reference" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.name.slice(0, 2)}
      image={logo && <img src={logo} alt={`${organization.name} logo`} style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }} />}
      groups={[{ title: "Organization Information", rows: [
        { label: "Origin", value: "Real-world reference" },
        { label: "Published teams", value: teams.length + csTeams.length },
        ...(academyTeams.length ? [{ label: "Academy teams", value: academyTeams.length }] : []),
        { label: "Game divisions", value: ["League of Legends", ...(csTeams.length ? ["Counter-Strike 2"] : [])].join(", ") },
      ] }]} />}>
    <ArticleSection {...sections[0]!}>
      <p>{organization.name} is an esports organization.</p>
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <p>Legal company identity, ownership, headquarters and staff history have not been imported.</p>
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <WikiTable caption="Game divisions and teams" columns={["Team", "Game", "League / status"]} empty="No teams listed."
        rows={[...teams.map((team) => ({ key: team.id, cells: [
          <Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, "League of Legends", team.league,
        ] })), ...csTeams.map((team) => ({ key: team.teamId, cells: [
          <Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, "Counter-Strike 2", "2027 starting five (roster frozen through 2027-05-23)",
        ] })), ...academyTeams.map((entry) => ({ key: entry.teamId, cells: [
          <Link key="team" href={`/wiki/teams/${entry.teamId}`}>{entry.name}</Link>, "League of Legends", `${entry.ecosystem} (academy of ${scene.teams.find((team) => team.id === entry.parentTeamId)?.name ?? organization.name})`,
        ] }))]} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}><details><summary>Sources</summary><ExternalSources scene={scene} ids={organization.sourceIds} /></details></ArticleSection>
  </WikiArticle>;
}

export function Tier2TeamArticle({ team, parent, roster }: { team: Tier2TeamLookup; parent?: { name: string; slug: string }; roster?: RosterEntryView[] }) {
  const sections = ["Overview", "Ecosystem", ...(roster?.length ? ["Player Roster"] : []), "Parent organization", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  const at = (title: string) => sections.find((section) => section.title === title)!;
  return <WikiArticle title={team.name} kind="Teams" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={team.name} monogram={team.name.slice(0, 2)} groups={[
    { title: "Team Information", rows: [
      { label: "Ecosystem", value: team.ecosystem }, { label: "Tier", value: "Tier 2" },
      { label: "Parent organization", value: parent ? <Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link> : "None confirmed" },
    ] },
  ]} />}>
    <ArticleSection {...at("Overview")}>
      <p><strong>{team.name}</strong> competes in the {team.ecosystem} for the 2027 season. {parent ? <>It is recorded as a distinct competitive entity from its parent organization, <Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link>, whose own Tier 1 membership and roster are tracked separately and are never merged with this entity&rsquo;s.</> : "No parent-organization relationship is established for this team."}</p>
    </ArticleSection>
    <ArticleSection {...at("Ecosystem")}>
      <p>{team.name} is one of 8 confirmed 2027 {team.ecosystem} participants, a Tier 2 regional ecosystem ({team.region}). See <Link href="/wiki/world">the competitive world</Link> for the full {team.ecosystem} field and the rest of the Tier 1 / Tier 2 structure.</p>
    </ArticleSection>
    {roster?.length ? <ArticleSection {...at("Player Roster")}><h3>Active</h3><TeamRosterTable roster={roster} caption={`${team.name} active roster`} /></ArticleSection> : null}
    <ArticleSection {...at("Parent organization")}>
      {parent ? <p><Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link> is this team&rsquo;s confirmed parent organization. The two remain separate competitive team entities; no roster, result, or membership is shared between them.</p>
        : <p>No parent-organization relationship is confirmed for this team.</p>}
    </ArticleSection>
    <ArticleSection {...at("Sources")}>
      <p>Canon record establishing the {team.ecosystem} 2027 ecosystem. See <Link href="/wiki/world">the competitive world</Link> for sourcing. {roster?.length ? "No result or standings data is tracked for this team." : "No roster, result, or standings data is tracked for this team."}</p>
    </ArticleSection>
  </WikiArticle>;
}

export function ExternalIndex({ scene, kind }: { scene: ExternalScene | undefined; kind: "teams" | "players" | "organizations" }) {
  if (!scene) return null;
  return <section className="contentSection"><h2>Pre-Worlds 2026 References</h2>
    {kind === "teams" ? <RealWorldTeamsTable teams={scene.teams} /> : <WikiTable caption={`Real-world ${kind}`} columns={kind === "players" ? ["Name", "Record type"] : ["Name", "Record type"]} rows={kind === "players" ? scene.players.map((p) => ({ key: p.id, cells: [<Link key="name" href={`/wiki/players/${p.slug}`}>{p.nickname}</Link>, "Tournament-roster reference"] })) : scene.organizations.map((o) => ({ key: o.id, cells: [<Link key="name" href={`/wiki/organizations/${o.slug}`}>{o.name}</Link>, "Esports brand"] }))} empty="No external references enabled." />}
  </section>;
}

const marketRegionLabel = (region: string) => ({ KR: "Korean", CN: "Chinese" } as Record<string, string>)[region] ?? region;

export function AddedPlayerArticle({ player, worldState }: { player: AddedPlayer2027; worldState: WorldState2027 }) {
  const assignment = findLcsAssignment(worldState, player.playerId);
  const retirement = findRetirement(worldState, player.playerId);
  const addedNationalities = nationalitiesOf(worldState, player.playerId, assignment?.league ?? "", player.nationality);
  const legalName = legalNameOf(worldState, player.playerId, player.legalName);
  const sections = ["Overview", "Background Information", "Team History", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={player.nickname} kind="Players" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Legal name", value: legalName ?? "Unknown" },
      { label: "Nationality", value: addedNationalities.length ? addedNationalities.join(", ") : "Unknown" }, ...(player.dateOfBirth ? [{ label: "Date of birth", value: formatDate(player.dateOfBirth) }] : []), { label: "Role", value: roleLabels[player.primaryRole] }] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.teamId.replace(/^external-lol-team-/, "external-")}`}>{assignment.team.name}</Link> },
      { label: "Role", value: roleLabels[assignment.starter.role] },
    ] }] : []),
    ...(retirement ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Retired" },
      { label: "Last team", value: retirement.previousTeamName ?? "Not established" },
    ] }] : []),
  ]} />}>
    <ArticleSection id="overview" title="Overview"><p>{player.nickname}{legalName ? ` (${legalName})` : ""} is a {roleLabels[player.primaryRole].toLowerCase()} player{addedNationalities[0] ? ` from ${addedNationalities[0]}` : ""}{assignment ? <>, confirmed as the starting {roleLabels[assignment.starter.role].toLowerCase()} of {assignment.team.name} for 2027</> : null}.</p></ArticleSection>
    <ArticleSection id="background-information" title="Background Information"><p>{player.sources.length ? "Legal name, nationality, and date of birth come from the cited external profile. " : legalName ? "Legal name and nationality come from the player's Leaguepedia page; date of birth is not established. " : "Legal name, nationality, and date of birth are not established. "}Contract details, signing dates, and full career history have not been imported.</p></ArticleSection>
    <ArticleSection id="team-history" title="Team History"><WikiTable caption="Referenced team history" columns={["Team", "Role", "Joined", "Basis"]} rows={[
      ...assignment ? [{ key: "2027", cells: [assignment.team.name, roleLabels[assignment.starter.role], "TBD", assignment.rosters.confirmedBy ? `Confirmed for 2027 as of ${formatDate(assignment.rosters.confirmedBy)}` : "Confirmed for 2027 (exact date not established)"] }] : [],
      ...player.history.map((entry) => ({ key: entry.teamName, cells: [entry.teamName, roleLabels[entry.role], formatDate(entry.joinedDate), entry.basis] })),
    ]} empty="No source-backed history imported." /></ArticleSection>
    <ArticleSection id="sources" title="Sources"><details><summary>Sources</summary><ul>{player.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer">{source.title}</a></li>)}</ul></details></ArticleSection>
  </WikiArticle>;
}


function csOrganizationSlug(team: CsTeam2027, worldState: WorldState2027): string {
  const added = worldState.csExternalRosters.organizations.find((org) => org.organizationId === team.organizationId);
  return added ? added.slug : (team.organizationId ?? "").replace(/^external-lol-org-/, "external-");
}

export function CsTeamArticle({ team, worldState, logo }: { team: CsTeam2027; worldState: WorldState2027; logo?: ReactNode }) {
  const rosters = worldState.csExternalRosters;
  const organizationName = team.organizationId
    ? (rosters.organizations.find((org) => org.organizationId === team.organizationId)?.name ?? team.name)
    : null;
  const location = teamLocationOf(worldState, team.teamId);
  const players = new Map(rosters.players.map((player) => [player.playerId, player]));
  const cases = rosters.continuityCases.filter((entry) => entry.playerTeamId === team.teamId);
  const sections = ["Overview", "Starting roster", "Timeline", "Organization", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={team.name} kind="Teams" game="Counter-Strike 2" sections={sections} infobox={<ArticleInfobox title={team.name} monogram={team.name.slice(0, 2)} image={logo} groups={[
    { title: "Team Information", rows: [
      { label: "Org Location", value: location ? <LocationValue country={location.orgCountry} /> : "TBD" },
      { label: "Team Location", value: location ? <LocationValue city={location.teamCity} country={location.teamCountry} /> : "TBD" },
      { label: "Head Coach", value: location?.headCoach ?? "TBD" },
    ] },
  ]} />}>
    <ArticleSection {...sections[0]!}>
      <p>{organizationOverviewOf(worldState, team.organizationId) ?? `${team.name} is a Counter-Strike 2 team.`}</p>
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <TeamRosterTable showRegion={false} caption={`${team.name} starting five`} empty="No roster imported." roster={team.starters.map((starter): RosterEntryView => {
        const player = players.get(starter.playerId);
        const reused = cases.find((entry) => entry.personId === starter.playerId);
        const nationality = player?.nationality ?? "United States";
        return {
          nationality, nationalities: [nationality], tenureId: `${team.teamId}-${starter.playerId}`, playerId: starter.playerId,
          slug: player?.slug ?? starter.playerId, href: player ? `/wiki/players/${player.slug}` : `/wiki/staff/${starter.playerId}`,
          note: reused?.rosterLabel ?? undefined, realName: player?.legalName ?? reused?.legalName ?? "—", nickname: starter.nickname, role: csRoleOf(worldState, starter.playerId) ?? "",
          rosterStatus: "active", isCaptain: false, isStarter: true, joinedDate: null, leftDate: null, contractEndDate: null,
          teamId: team.teamId, teamName: team.name, teamSlug: team.slug ?? null,
        };
      })} />
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      {cases.length ? <ul className="articleTimeline">{cases.map((entry) => <li key={entry.caseId}>
        <strong>{formatDate(entry.effectiveFrom)}</strong> <span>{entry.statements.join(" ")} {entry.notEstablished.join(" ")}</span>
      </li>)}</ul> : <p>No dated roster events are established. The research date of the source snapshot is not a signing date.</p>}
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      {team.organizationId
        ? <p><Link href={`/wiki/organizations/${csOrganizationSlug(team, worldState)}`}>{organizationName}</Link> is the global organization identity; this Counter-Strike 2 team is one of its game divisions.{team.organizationAction === "existing-organization-cs-team-created" ? " The identity is shared with the organization's League of Legends division." : ""}</p>
        : <p>This team has no organization link.</p>}
    </ArticleSection>
    <ArticleSection {...sections[4]!}><details><summary>Sources</summary><ul>
      <li>Kairos Universe canon directive: Counter-Strike 2 external rosters.</li>
      <li><a href={team.externalReferences[0]?.url} rel="noreferrer">HLTV team page {team.hltvTeamId}</a>, referenced in the author-supplied workbook (researched {formatDate(rosters.referenceSnapshot.researchDate)}).</li>
    </ul></details></ArticleSection>
  </WikiArticle>;
}

export function CsPlayerArticle({ player, worldState }: { player: CsPlayer2027; worldState: WorldState2027 }) {
  const assignment = findCsAssignment(worldState, player.playerId);
  const sections = ["Overview", "Background Information", "Team History", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={player.nickname} kind="Players" game="Counter-Strike 2" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Full name", value: player.legalName },
      { label: "Nationality", value: player.nationality }, { label: "Game", value: "Counter-Strike 2" },
      ...(csRoleOf(worldState, player.playerId) ? [{ label: "Role", value: <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><CsRoleIcons role={csRoleOf(worldState, player.playerId)} />{csRoleOf(worldState, player.playerId)}</span> }] : [])] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link> },
    ] }] : []),
  ]} />}>
    <ArticleSection {...sections[0]!}><p>{player.nickname} ({player.legalName}) is a Counter-Strike 2 player from {player.nationality}{assignment ? <>, in the 2027 starting five of <Link href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link></> : null}. Age, contract and results are not established.</p></ArticleSection>
    <ArticleSection {...sections[1]!}><p>Nickname, full name and nationality come from the author-supplied roster workbook. Birth date, previous teams, achievements and statistics have not been imported.</p></ArticleSection>
    <ArticleSection {...sections[2]!}><WikiTable caption="2027 roster" columns={["Team", "Status", "Joined"]} rows={assignment ? [{ key: "2027", cells: [<Link key="team" href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link>, "2027 starting five", "TBD (no signing date established)"] }] : []} empty="No roster history imported." /></ArticleSection>
    <ArticleSection {...sections[3]!}><details><summary>Sources</summary><ul><li>Kairos Universe canon directive: Counter-Strike 2 external rosters (HLTV reference snapshot, 2026-11-06).</li></ul></details></ArticleSection>
  </WikiArticle>;
}

export function CsOrganizationArticle({ organization, worldState }: { organization: CsOrganization2027; worldState: WorldState2027 }) {
  const teams = csTeamsOfOrganization(worldState, organization.organizationId);
  const sections = [{ id: "overview", title: "Overview" }, { id: "teams", title: "Game divisions" }, { id: "sources", title: "Sources" }];
  return <WikiArticle title={organization.name} kind="Organizations" game="Real-world reference" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.name.slice(0, 2)} groups={[{ title: "Organization Information", rows: [
      { label: "Origin", value: "Real-world reference" }, { label: "Game divisions", value: "Counter-Strike 2" },
    ] }]} />}>
    <ArticleSection {...sections[0]!}><p>{organization.name} is an esports organization with a Counter-Strike 2 division. Headquarters, ownership and staff have not been imported.</p></ArticleSection>
    <ArticleSection {...sections[1]!}><WikiTable caption="Game divisions and teams" columns={["Team", "Game", "Status"]} empty="No teams listed."
      rows={teams.map((team) => ({ key: team.teamId, cells: [<Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, "Counter-Strike 2", "2027 starting five (roster frozen through 2027-05-23)"] }))} /></ArticleSection>
    <ArticleSection {...sections[2]!}><details><summary>Sources</summary><ul><li>Kairos Universe canon directive: Counter-Strike 2 external rosters (HLTV reference snapshot, 2026-11-06).</li></ul></details></ArticleSection>
  </WikiArticle>;
}
