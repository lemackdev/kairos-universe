import Link from "next/link";
import { ArticleInfobox, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";
import { RealWorldTeamsTable } from "./RealWorldTeamsTable";
import { externalLogoPath } from "@/lib/externalLogos";
import { ExternalRosterTable } from "@/components/ExternalRosterTable";
import { formatDate } from "@/lib/formatting/date";
import type { ExternalScene, SceneOrganization, ScenePlayer, SceneTeam } from "@/types/external-scene";
const roleLabels = { top: "Top", jungle: "Jungle", mid: "Mid", bot: "Bot / ADC", support: "Support" };

export function ReferenceNotice() {
  return <p className="fictionNotice"><strong>Real-world reference, review pending.</strong> This is a pre-Worlds 2026 domestic tournament snapshot, not a live roster or fictional Kairos event. Tournament membership does not establish a contract, captaincy, or permanent starting position. <Link href="/wiki/world">Scope and source limitations</Link>.</p>;
}

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
    <ReferenceNotice />
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
    <ArticleSection id="sources" title="Sources"><ExternalSources scene={scene} ids={team.sourceIds} /></ArticleSection>
  </WikiArticle>;
}

export function ExternalPlayerArticle({ player, scene }: { player: ScenePlayer; scene: ExternalScene }) {
  const tenures = scene.rosterTenures.filter((t) => player.rosterTenureIds.includes(t.id)).sort((a, b) => a.observedAtEventEnd.localeCompare(b.observedAtEventEnd));
  const sections = ["Overview", "Background Information", "Team History", "Trivia", "Individual Awards", "Tournament Results", "Sources"].map((title) => ({ title, id: title.toLowerCase().replaceAll(" ", "-") }));
  return <WikiArticle title={player.nickname} kind="Players" game="League of Legends" sections={sections} infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.slice(0, 2)} groups={[
    { title: "Background Information", rows: [{ label: "Nickname", value: player.nickname }, { label: "Legal name", value: "Unknown" },
      { label: "Nationality", value: "Unknown" }, { label: "Date of birth", value: "Unknown" }, { label: "Current contract", value: "Unknown" }] },
  ]} />}>
    <ReferenceNotice />
    <ArticleSection id="overview" title="Overview"><p>{player.nickname} appears in the source tournament roster lists below. This page does not assert a current club, age, or full career history.</p></ArticleSection>
    <ArticleSection id="background-information" title="Background Information"><p>Personal biography, nationality, residence, date of birth, contract details and captaincy have not been researched in this import.</p></ArticleSection>
    <ArticleSection id="team-history" title="Team History"><WikiTable caption="Observed tournament memberships, not dated contracts" columns={["Team", "League", "Role", "Listing", "Tournament ended"]} rows={tenures.map((tenure) => {
      const team = scene.teams.find((t) => t.id === tenure.teamId)!;
      return { key: tenure.id, cells: [<Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, team.league, roleLabels[tenure.role], tenure.designation, formatDate(tenure.observedAtEventEnd)] };
    })} empty="No source-backed history imported." /></ArticleSection>
    <ArticleSection id="trivia" title="Trivia"><p>No trivia imported.</p></ArticleSection>
    <ArticleSection id="individual-awards" title="Individual Awards"><p>Awards have not been imported. This does not mean the player has none.</p></ArticleSection>
    <ArticleSection id="tournament-results" title="Tournament Results"><p>Results and statistics have not been imported. Roster membership alone does not establish games played or placement.</p></ArticleSection>
    <ArticleSection id="sources" title="Sources"><ExternalSources scene={scene} ids={player.sourceIds} /></ArticleSection>
  </WikiArticle>;
}

export function ExternalOrganizationArticle({ organization, scene }: { organization: SceneOrganization; scene: ExternalScene }) {
  const logo = externalLogoPath(organization.slug);
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "organization-information", title: "Organization Information" },
    { id: "teams", title: "Teams" },
    { id: "sources", title: "Sources" },
  ];
  const teams = scene.teams.filter((team) => organization.teamIds.includes(team.id));
  return <WikiArticle title={organization.name} kind="Organizations" game="Real-world reference" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.name.slice(0, 2)}
      image={logo && <img src={logo} alt={`${organization.name} logo`} style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }} />}
      groups={[{ title: "Organization Information", rows: [
        { label: "Origin", value: "Real-world reference" },
        { label: "Published teams", value: teams.length },
        { label: "Ownership", value: "Unknown" },
      ] }]} />}>
    <ReferenceNotice />
    <ArticleSection {...sections[0]!}>
      <p>{organization.name} is a real-world esports brand reference, not a fictional Kairos organization.</p>
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <p>Legal company identity, ownership, headquarters and staff history have not been imported.</p>
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <WikiTable caption="Referenced teams" columns={["Team", "League"]} empty="No teams listed."
        rows={teams.map((team) => ({ key: team.id, cells: [
          <Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>, team.league,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}><ExternalSources scene={scene} ids={organization.sourceIds} /></ArticleSection>
  </WikiArticle>;
}

export function ExternalIndex({ scene, kind }: { scene: ExternalScene | undefined; kind: "teams" | "players" | "organizations" }) {
  if (!scene) return null;
  return <section className="contentSection"><h2>Pre-Worlds 2026 References</h2><ReferenceNotice />
    {kind === "teams" ? <RealWorldTeamsTable teams={scene.teams} /> : <WikiTable caption={`Real-world ${kind}`} columns={kind === "players" ? ["Name", "Record type"] : ["Name", "Record type"]} rows={kind === "players" ? scene.players.map((p) => ({ key: p.id, cells: [<Link key="name" href={`/wiki/players/${p.slug}`}>{p.nickname}</Link>, "Tournament-roster reference"] })) : scene.organizations.map((o) => ({ key: o.id, cells: [<Link key="name" href={`/wiki/organizations/${o.slug}`}>{o.name}</Link>, "Esports brand"] }))} empty="No external references enabled." />}
  </section>;
}
