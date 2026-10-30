import Link from "next/link";
import type { OrganizationView, TeamView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { StaffTable } from "@/components/StaffTable";
import { hasKairosDbProfile, kairosDbTeamUrl } from "@/lib/links";
import { ArticleInfobox, ArticleLink, ArticleSection, Facts, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "history", title: "History" }, { id: "team-information", title: "Team Information" },
  { id: "timeline", title: "Timeline" }, { id: "player-roster", title: "Player Roster" },
  { id: "former", title: "Former" }, { id: "organization", title: "Organization" },
  { id: "sources", title: "Sources" },
];

export function TeamArticle({ team, organization }: { team: TeamView; organization?: OrganizationView }) {
  const captain = team.roster.find((player) => player.playerId === team.captainPlayerId);
  const facts = [
    { label: "Organization", value: organization ? <Link href={`/wiki/organizations/${organization.slug}`}>{organization.name}</Link> : "TBD" },
    { label: "Game", value: team.gameName },
    { label: "Roster level", value: team.rosterLevel },
    { label: "Competitive state", value: team.competitiveState },
    { label: "Intended competition", value: team.intendedCompetition },
    { label: "Training location", value: [team.trainingLocation.city, team.trainingLocation.region, team.trainingLocation.country].filter((part) => part && part !== "TBD").join(", ") || "TBD" },
    { label: "Captain", value: captain ? <Link href={`/wiki/players/${captain.slug}`}>{captain.nickname}</Link> : "TBD" },
    { label: "Planned debut", value: team.officialDebutPeriod },
  ];
  return <WikiArticle title={team.name} game={team.gameName} kind="Teams" sections={sections}
    infobox={<ArticleInfobox title={team.shortName} monogram={team.shortName.slice(0, 1)} groups={[
      { title: "Team Information", rows: facts.slice(0, 6) },
      { title: "Competitive", rows: facts.slice(6) },
    ]} />}>
    <p><strong>{team.name}</strong> is the {team.gameName} {team.rosterLevel} team of {organization?.name ?? "an organization yet to be published"}.</p>
    <ArticleSection {...sections[0]!}>
      {team.history.length ? team.history.map((fact) => <p key={fact}>{fact}</p>) : <p>No team history is recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <Facts rows={facts} />
      {team.officialMatchCount === 0 && <p>No official matches recorded.</p>}
      <p>Information current to {team.currentStoryPeriod}. Planned participation is subject to confirmation.</p>
      {hasKairosDbProfile("team", team.id) && <p><a href={kairosDbTeamUrl(team.slug)}>Competitive profile on KairosDB</a></p>}
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <details open><summary>Recorded events ({team.timeline.length})</summary>
        <ol className="articleTimeline">{team.timeline.map((episode) => <li key={episode.id}>
          <strong>{episode.date ?? "Date TBD"}</strong> <span>Episode {episode.number}: {episode.title}</span>
          <p>{episode.summary}</p>
        </li>)}</ol>
      </details>
      <p><strong>{team.officialDebutPeriod}:</strong> planned competitive debut. Exact date TBD.</p>
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <h3>Active</h3>
      <WikiTable caption={`${team.shortName} active roster`} columns={["ID", "Name", "Role", "Joined", "Status"]}
        empty="No active players recorded." rows={team.roster.map((player) => ({
          key: player.tenureId, cells: [<Link key="link" href={`/wiki/players/${player.slug}`}>{player.nickname}</Link>,
            player.realName, player.role, player.joinedDate ?? "TBD", player.isCaptain ? "Active / Captain" : player.rosterStatus],
        }))} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="Former players" columns={["ID", "Name", "Role", "Joined", "Left"]}
        empty="No former players recorded." rows={team.formerRoster.map((player) => ({
          key: player.tenureId, cells: [<ArticleLink key="link" href={`/wiki/players/${player.slug}`}>{player.nickname}</ArticleLink>,
            player.realName, player.role, player.joinedDate ?? "TBD", player.leftDate ?? "TBD"],
        }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {organization && <p><Link href={`/wiki/organizations/${organization.slug}`}>{organization.name}</Link></p>}
      <h3>Coaching and support staff</h3><StaffTable staff={team.staff} />
      <h3>Mentorship</h3>
      <WikiTable caption="Confirmed mentorships" columns={["Player", "Mentor", "Assignment"]} empty="No confirmed mentors recorded."
        rows={team.mentors.map((mentor) => ({ key: mentor.playerId, cells: [
          team.roster.find((player) => player.playerId === mentor.playerId)?.nickname ?? mentor.playerName,
          mentor.nickname ?? mentor.name, mentor.role,
        ] }))} />
      <p>Mentorship is shown separately from team employment. Real-world figures appear in fictional Kairos roles.</p>
    </ArticleSection>
    <ArticleSection {...sections[6]!}><SourceList sources={team.sources} /></ArticleSection>
  </WikiArticle>;
}
