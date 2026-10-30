import Link from "next/link";
import type { PlayerView, TeamView } from "@/types/catalog";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { SourceList } from "@/components/SourceList";
import { hasKairosDbProfile, kairosDbPlayerUrl } from "@/lib/links";
import { ArticleInfobox, ArticleLink, ArticleSection, Facts, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "overview", title: "Overview" }, { id: "background-information", title: "Background Information" },
  { id: "team-history", title: "Team History" }, { id: "trivia", title: "Trivia" },
  { id: "individual-awards", title: "Individual Awards" }, { id: "tournament-results", title: "Tournament Results" },
  { id: "sources", title: "Sources" },
];

export function PlayerArticle({ player, team, narrativeDate }: { player: PlayerView; team?: TeamView; narrativeDate: string }) {
  const background = [
    { label: "Name", value: player.realName },
    { label: "Nationality", value: player.nationality ?? "TBD" },
    { label: "Date of birth", value: player.dateOfBirth ?? "TBD" },
    { label: "Age", value: player.age == null ? "TBD" : `${player.age} (as of ${narrativeDate})` },
    { label: "City", value: player.city ?? "TBD" },
  ];
  const competitive = [
    { label: "Game", value: player.gameName },
    { label: "Team", value: team ? <Link href={`/wiki/teams/${team.slug}`}>{team.shortName}</Link> : "TBD" },
    { label: "Role", value: player.role },
    { label: "Status", value: player.status.replaceAll("-", " ") },
    { label: "Captain", value: player.isCaptain ? "Yes" : "No" },
  ];
  return <WikiArticle title={player.nickname} game={player.gameName} kind="Players" sections={sections}
    infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.length <= 3 ? player.nickname : player.nickname.slice(0, 2)} groups={[
      { title: "Background Information", rows: background }, { title: "Competitive", rows: competitive },
    ]} />}>
    <ArticleSection {...sections[0]!}>
      <p><strong>{player.realName}</strong>, known as <strong>{player.nickname}</strong>, plays {player.role} for <ArticleLink href={team ? `/wiki/teams/${team.slug}` : null}>{player.currentTeamName}</ArticleLink> in {player.gameName}.{player.isCaptain ? " The player is the team captain." : ""}</p>
      <Facts rows={competitive} />
      {hasKairosDbProfile("player", player.slug) && <p><a href={kairosDbPlayerUrl(player.slug)}>Competitive profile on KairosDB</a></p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <Facts rows={background} />
      <h3>First appearance</h3>
      {player.firstAppearance ? <EpisodeReferenceList episodes={[player.firstAppearance]} /> : <p>TBD</p>}
      <h3>Mentorship</h3>
      <p>{player.mentor ? <><strong>{player.mentor.nickname ?? player.mentor.name}</strong> is the confirmed {player.mentor.role}.
        {player.mentor.realWorldFigure && " This real-world figure appears in a fictional Kairos role."}</> : "No confirmed mentorship recorded."}</p>
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <WikiTable caption={`${player.nickname} team history`} columns={["Team", "Role", "Start", "End", "Status"]} empty="No team history recorded."
        rows={player.teamHistory.map((tenure) => ({ key: tenure.tenureId, cells: [
          <ArticleLink key="team" href={tenure.teamSlug ? `/wiki/teams/${tenure.teamSlug}` : null}>{tenure.teamName}</ArticleLink>,
          tenure.role, tenure.joinedDate ?? "TBD", tenure.leftDate ?? (tenure.rosterStatus === "active" ? "Present" : "TBD"), tenure.rosterStatus,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      {player.trivia.length ? <ul>{player.trivia.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p>No confirmed trivia recorded.</p>}
      <h3>Historical aliases</h3>
      <WikiTable caption="Aliases and canon corrections" columns={["Alias", "Status", "Notes"]} empty="No historical aliases recorded."
        rows={player.historicalAliases.map((alias) => ({ key: `${alias.nickname}-${alias.sourceEpisode}`,
          cells: [alias.nickname, alias.status, alias.notes] }))} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="Individual awards" columns={["Date", "Award", "Tournament"]} empty="No confirmed individual awards recorded."
        rows={player.awards.map((award) => ({ key: award.id, cells: [award.date ?? "TBD", award.name, award.competitionName ?? "TBD"] }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {player.officialMatchCount === 0 && <p>No official matches recorded.</p>}
      <WikiTable caption={`${player.nickname} tournament results`} columns={["Date", "Place", "Tournament", "Team"]} empty="No confirmed tournament results recorded."
        rows={player.tournamentResults.map((result) => ({ key: result.id, cells: [
          result.date ?? "TBD", result.place ?? "TBD",
          <Link key="event" href={`/wiki/competitions/${result.competitionSlug}`}>{result.competitionName}</Link>,
          <ArticleLink key="team" href={result.teamSlug ? `/wiki/teams/${result.teamSlug}` : null}>{result.teamName}</ArticleLink>,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[6]!}>
      <SourceList sources={[...player.sources, ...player.awards.flatMap((award) => award.sources)].filter((source, index, all) => all.findIndex((entry) => entry.id === source.id) === index)} />
      <details><summary>Episode appearances ({player.episodeAppearances.length})</summary><EpisodeReferenceList episodes={player.episodeAppearances} /></details>
    </ArticleSection>
  </WikiArticle>;
}
