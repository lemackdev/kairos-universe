import Link from "next/link";
import { ArticleInfobox, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";
import { RealWorldTeamsTable } from "./RealWorldTeamsTable";
import { externalLogoPath } from "@/lib/externalLogos";
import { ExternalRosterTable } from "@/components/ExternalRosterTable";
import { formatDate } from "@/lib/formatting/date";
import type { ExternalScene, SceneOrganization, ScenePlayer, SceneTeam } from "@/types/external-scene";
import type { AddedPlayer2027, CsOrganization2027, CsPlayer2027, CsTeam2027, WorldState2027 } from "@/types/world-state-2027";
import { csTeamsOfOrganization, findCsAssignment, findFreeAgent, findLcsAssignment, findMarketAvailability, findRetirement, rosterSets, type Tier2TeamLookup } from "@/lib/external/worldState2027";
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
    { title: "Team Information", rows: [{ label: "League", value: team.league }, { label: "Region", value: team.region },
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
  return <WikiArticle title={player.nickname} kind="Players" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Legal name", value: "Unknown" },
      { label: "Nationality", value: "Unknown" }, { label: "Date of birth", value: "Unknown" }, { label: "Current contract", value: "Unknown" }] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Starter" },
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.teamId.replace(/^external-lol-team-/, "external-")}`}>{assignment.team.name}</Link> },
      { label: "Role", value: roleLabels[assignment.starter.role] },
      { label: "Lineup confirmed", value: assignment.rosters.confirmedBy ? formatDate(assignment.rosters.confirmedBy) : (assignment.rosters.displayPeriod ?? "January 2027 (exact date not established)") },
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
  return <WikiArticle title={organization.name} kind="Organizations" game="Real-world reference" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.name.slice(0, 2)}
      image={logo && <img src={logo} alt={`${organization.name} logo`} style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }} />}
      groups={[{ title: "Organization Information", rows: [
        { label: "Origin", value: "Real-world reference" },
        { label: "Published teams", value: teams.length + csTeams.length },
        { label: "Game divisions", value: ["League of Legends", ...(csTeams.length ? ["Counter-Strike 2"] : [])].join(", ") },
        { label: "Ownership", value: "Unknown" },
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
        ] }))]} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}><details><summary>Sources</summary><ExternalSources scene={scene} ids={organization.sourceIds} /></details></ArticleSection>
  </WikiArticle>;
}

export function Tier2TeamArticle({ team, parent, roster }: { team: Tier2TeamLookup; parent?: { name: string; slug: string }; roster?: Array<{ role: string; nickname: string; slug: string }> }) {
  const sections = ["Overview", "Ecosystem", ...(roster?.length ? ["Player Roster"] : []), "Parent organization", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  const at = (title: string) => sections.find((section) => section.title === title)!;
  return <WikiArticle title={team.name} kind="Teams" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={team.name} monogram={team.name.slice(0, 2)} groups={[
    { title: "Team Information", rows: [
      { label: "Ecosystem", value: team.ecosystem }, { label: "Tier", value: "Tier 2" }, { label: "Region", value: team.region },
      { label: "Parent organization", value: parent ? <Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link> : "None confirmed" },
    ] },
  ]} />}>
    <ArticleSection {...at("Overview")}>
      <p><strong>{team.name}</strong> competes in the {team.ecosystem} for the 2027 season. {parent ? <>It is recorded as a distinct competitive entity from its parent organization, <Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link>, whose own Tier 1 membership and roster are tracked separately and are never merged with this entity&rsquo;s.</> : "No parent-organization relationship is established for this team."}</p>
    </ArticleSection>
    <ArticleSection {...at("Ecosystem")}>
      <p>{team.name} is one of 8 confirmed 2027 {team.ecosystem} participants, a Tier 2 regional ecosystem ({team.region}). See <Link href="/wiki/world">the competitive world</Link> for the full {team.ecosystem} field and the rest of the Tier 1 / Tier 2 structure.</p>
    </ArticleSection>
    {roster?.length ? <ArticleSection {...at("Player Roster")}><ExternalRosterTable caption={`${team.name} ${team.ecosystem} 2027 roster`} rows={roster.map((entry) => ({ id: `${team.teamId}-${entry.slug}`, role: entry.role, roleLabel: roleLabels[entry.role as keyof typeof roleLabels], nickname: entry.nickname, slug: entry.slug, designation: "2027 starter" }))} /></ArticleSection> : null}
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
  const sections = ["Overview", "Background Information", "Team History", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={player.nickname} kind="Players" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Legal name", value: player.legalName ?? "Unknown" },
      { label: "Nationality", value: player.nationality ?? "Unknown" }, { label: "Date of birth", value: player.dateOfBirth ? formatDate(player.dateOfBirth) : "Unknown" }, { label: "Role", value: roleLabels[player.primaryRole] }] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Starter" },
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.teamId.replace(/^external-lol-team-/, "external-")}`}>{assignment.team.name}</Link> },
      { label: "Role", value: roleLabels[assignment.starter.role] },
      { label: "Lineup confirmed", value: assignment.rosters.confirmedBy ? formatDate(assignment.rosters.confirmedBy) : (assignment.rosters.displayPeriod ?? "January 2027 (exact date not established)") },
    ] }] : []),
    ...(retirement ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Retired" },
      { label: "Last team", value: retirement.previousTeamName ?? "Not established" },
    ] }] : []),
  ]} />}>
    <ArticleSection id="overview" title="Overview"><p>{player.nickname}{player.legalName ? ` (${player.legalName})` : ""} is a {roleLabels[player.primaryRole].toLowerCase()} player{player.nationality ? ` from ${player.nationality}` : ""}{assignment ? <>, confirmed as the starting {roleLabels[assignment.starter.role].toLowerCase()} of {assignment.team.name} for 2027</> : null}.</p></ArticleSection>
    <ArticleSection id="background-information" title="Background Information"><p>{player.sources.length ? "Legal name, nationality, and date of birth come from the cited external profile. " : "Legal name, nationality, and date of birth are not established. "}Contract details, signing dates, and full career history have not been imported.</p></ArticleSection>
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

export function CsTeamArticle({ team, worldState }: { team: CsTeam2027; worldState: WorldState2027 }) {
  const rosters = worldState.csExternalRosters;
  const freeze = worldState.csRosterFreeze;
  const organizationName = team.organizationId
    ? (rosters.organizations.find((org) => org.organizationId === team.organizationId)?.name ?? team.name)
    : null;
  const players = new Map(rosters.players.map((player) => [player.playerId, player]));
  const cases = rosters.continuityCases.filter((entry) => entry.playerTeamId === team.teamId);
  const sections = ["Overview", "Starting roster", "Timeline", "Organization", "Roster freeze", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={team.name} kind="Teams" game="Counter-Strike 2" sections={sections} infobox={<ArticleInfobox title={team.name} monogram={team.name.slice(0, 2)} groups={[
    { title: "Team Information", rows: [
      { label: "Game", value: "Counter-Strike 2" },
      { label: "HLTV team ID", value: <a href={team.externalReferences[0]?.url} rel="noreferrer">{team.hltvTeamId}</a> },
      { label: "Organization", value: team.organizationId ? <Link href={`/wiki/organizations/${csOrganizationSlug(team, worldState)}`}>{organizationName}</Link> : "Awaiting identity review" },
      { label: "2027 roster", value: "Starting five" },
      { label: "Roster freeze", value: `Through ${formatDate(freeze.freezeThrough)}` },
      { label: "Qualification", value: "Not established" },
    ] },
  ]} />}>
    <ArticleSection {...sections[0]!}>
      <p><strong>{team.name}</strong> is a Counter-Strike 2 team in the Kairos Universe 2027 competitive ecosystem. Its five starting players are listed below. In-game roles, contract dates and results are not established.</p>
      {team.notes?.map((note) => <p key={note} className="muted">{note}</p>)}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <WikiTable caption={`${team.name} starting five`} columns={["Player", "Name", "Nationality"]} empty="No roster imported." rows={team.starters.map((starter) => {
        const player = players.get(starter.playerId);
        const reused = cases.find((entry) => entry.personId === starter.playerId);
        return { key: starter.playerId, cells: [
          <span key="player"><Link href={player ? `/wiki/players/${player.slug}` : `/wiki/staff/${starter.playerId}`}>{starter.nickname}</Link>{reused?.rosterLabel ? <> <em>({reused.rosterLabel})</em></> : null}</span>,
          player?.legalName ?? reused?.legalName ?? "—",
          player?.nationality ?? "United States",
        ] };
      })} />
      <p className="muted">{rosters.roleNote}</p>
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
    <ArticleSection {...sections[4]!}>
      <p>This roster is frozen through {formatDate(freeze.freezeThrough)} (inclusive), the final day of the PGL Copenhagen Major 2027. The earliest author-approved change date is {formatDate(freeze.earliestLaterChangeDate)}; no change is automatic. The freeze does not imply that this team qualified for the Major.</p>
    </ArticleSection>
    <ArticleSection {...sections[5]!}><details><summary>Sources</summary><ul>
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
      { label: "Nationality", value: player.nationality }, { label: "Game", value: "Counter-Strike 2" }] },
    ...(assignment ? [{ title: "Kairos Universe 2027", rows: [
      { label: "2027 status", value: "Starting five" },
      { label: "Team", value: <Link href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link> },
      { label: "Roster freeze", value: `Through ${formatDate(worldState.csRosterFreeze.freezeThrough)}` },
    ] }] : []),
  ]} />}>
    <ArticleSection {...sections[0]!}><p>{player.nickname} ({player.legalName}) is a Counter-Strike 2 player from {player.nationality}{assignment ? <>, in the 2027 starting five of <Link href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link></> : null}. Role, age, contract and results are not established.</p></ArticleSection>
    <ArticleSection {...sections[1]!}><p>Nickname, full name and nationality come from the author-supplied roster workbook. Birth date, role, previous teams, achievements and statistics have not been imported.</p></ArticleSection>
    <ArticleSection {...sections[2]!}><WikiTable caption="2027 roster" columns={["Team", "Status", "Joined"]} rows={assignment ? [{ key: "2027", cells: [<Link key="team" href={`/wiki/teams/${assignment.team.slug}`}>{assignment.team.name}</Link>, "2027 starting five", "TBD (no signing date established)"] }] : []} empty="No roster history imported." /></ArticleSection>
    <ArticleSection {...sections[3]!}><details><summary>Sources</summary><ul><li>Kairos Universe canon directive: Counter-Strike 2 external rosters (HLTV reference snapshot, 2026-11-06).</li></ul></details></ArticleSection>
  </WikiArticle>;
}

export function CsOrganizationArticle({ organization, worldState }: { organization: CsOrganization2027; worldState: WorldState2027 }) {
  const teams = csTeamsOfOrganization(worldState, organization.organizationId);
  const sections = [{ id: "overview", title: "Overview" }, { id: "teams", title: "Game divisions" }, { id: "sources", title: "Sources" }];
  return <WikiArticle title={organization.name} kind="Organizations" game="Real-world reference" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.name.slice(0, 2)} groups={[{ title: "Organization Information", rows: [
      { label: "Origin", value: "Real-world reference" }, { label: "Game divisions", value: "Counter-Strike 2" }, { label: "Ownership", value: "Unknown" },
    ] }]} />}>
    <ArticleSection {...sections[0]!}><p>{organization.name} is an esports organization with a Counter-Strike 2 division. Headquarters, ownership and staff have not been imported.</p></ArticleSection>
    <ArticleSection {...sections[1]!}><WikiTable caption="Game divisions and teams" columns={["Team", "Game", "Status"]} empty="No teams listed."
      rows={teams.map((team) => ({ key: team.teamId, cells: [<Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, "Counter-Strike 2", "2027 starting five (roster frozen through 2027-05-23)"] }))} /></ArticleSection>
    <ArticleSection {...sections[2]!}><details><summary>Sources</summary><ul><li>Kairos Universe canon directive: Counter-Strike 2 external rosters (HLTV reference snapshot, 2026-11-06).</li></ul></details></ArticleSection>
  </WikiArticle>;
}
