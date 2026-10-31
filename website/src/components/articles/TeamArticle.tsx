import Link from "next/link";
import { BrandLogo, UniformPanel } from "@/components/UniformPanel";
import { TeamRosterTable } from "@/components/TeamRosterTable";
import type { OrganizationView, TeamView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { ManagementTable } from "@/components/ManagementTable";
import { hasKairosDbProfile, kairosDbTeamUrl } from "@/lib/links";
import { ArticleInfobox, ArticleLink, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "history", title: "History" }, { id: "team-information", title: "Team Information" },
  { id: "timeline", title: "Timeline" }, { id: "player-roster", title: "Player Roster" },
  { id: "former", title: "Former" }, { id: "organization", title: "Organization" },
  { id: "uniform", title: "Uniform" }, { id: "sources", title: "Sources" },
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
    infobox={<ArticleInfobox title={team.shortName} monogram={team.shortName.slice(0, 1)} image={organization && <BrandLogo organizationId={organization.id} />} groups={[
      { title: "Team Information", rows: facts },
    ]} />}>
    <p><strong>{team.name}</strong> is the {team.gameName} {team.rosterLevel} roster of {organization?.name ?? "an organization yet to be published"}, a Los Angeles-based esports organization founded by Adrian Vale under parent company Asterion Intelligence. Rather than assembling the roster through a club acquisition, Kairos built it through its own player-development recruitment process, beginning in early 2026. The {team.gameName} division is intended to debut in the {team.intendedCompetition}, and as of {team.currentStoryPeriod} has not yet played an official match.</p>
    <ArticleSection {...sections[0]!}>
      {team.history.length ? team.history.map((fact) => <p key={fact}>{fact}</p>) : <p>No team history is recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
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
      <TeamRosterTable roster={team.roster} caption={`${team.shortName} active roster`} />
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
      {organization?.ownerName && <p><strong>Owner and Founder:</strong> {organization.ownerName}</p>}
      <h3>Management and staff</h3>
      <ManagementTable staff={(organization?.management ?? []).filter(
        (person) => person.division === team.gameName || person.division === "TBD",
      )} />
    </ArticleSection>
    <ArticleSection {...sections[6]!}><UniformPanel teamId={team.id} /></ArticleSection>
    <ArticleSection {...sections[7]!}>
      <details><summary>Sources ({team.sources.length})</summary><SourceList sources={team.sources} /></details>
    </ArticleSection>
  </WikiArticle>;
}
