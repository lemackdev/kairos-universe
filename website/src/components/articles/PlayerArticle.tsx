import Link from "next/link";
import { PlayerPortrait } from "@/components/PlayerPortrait";
import { NationalityFlags } from "@/components/NationalityFlags";
import type { PlayerView, TeamView } from "@/types/catalog";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PlayerTeamHistoryTable } from "@/components/PlayerTeamHistoryTable";
import { SourceList } from "@/components/SourceList";
import { hasKairosDbProfile, kairosDbPlayerUrl } from "@/lib/links";
import { formatDate } from "@/lib/formatting/date";
import { ArticleInfobox, ArticleLink, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "overview", title: "Overview" }, { id: "background-information", title: "Background Information" },
  { id: "team-history", title: "Team History" }, { id: "trivia", title: "Trivia" },
  { id: "individual-awards", title: "Individual Awards" }, { id: "tournament-results", title: "Tournament Results" },
  { id: "sources", title: "Sources" },
];

export function PlayerArticle({ player, team, narrativeDate }: { player: PlayerView; team?: TeamView; narrativeDate: string }) {
  const background = [
    { label: "Name", value: player.realName },
    { label: "Nationality", value: <NationalityFlags nationality={player.nationality} nationalities={player.nationalities} /> },
    { label: "Date of birth", value: formatDate(player.dateOfBirth) },
    { label: "Age", value: player.age == null ? "TBD" : `${player.age} (as of ${formatDate(narrativeDate)})` },
    { label: "City", value: player.city ? player.cityRegion ? `${player.city}, ${player.cityRegion}` : player.city : "TBD" },
  ];
  const competitive = [
    { label: "Game", value: player.gameName },
    { label: "Team", value: team ? <Link href={`/wiki/teams/${team.slug}`}>{team.shortName}</Link> : "TBD" },
    { label: "Role", value: player.role },
    ...(player.historicalAliases.length ? [{ label: "Competitive IDs", value: [player.nickname, ...player.historicalAliases.map((alias) => alias.nickname)].join(", ") }] : []),
  ];
  return <WikiArticle title={player.nickname} game={player.gameName} kind="Players" sections={sections}
    infobox={<ArticleInfobox title={player.nickname} monogram={player.nickname.length <= 3 ? player.nickname : player.nickname.slice(0, 2)} image={<PlayerPortrait playerId={player.id} />} groups={[
      { title: "Background Information", rows: background }, { title: "Competitive", rows: competitive },
    ]} />}>
    <ArticleSection {...sections[0]!}>
      <p><strong>{player.realName}</strong>, known as <strong>{player.nickname}</strong>, plays {player.role} for <ArticleLink href={team ? `/wiki/teams/${team.slug}` : null}>{player.currentTeamName}</ArticleLink> in {player.gameName}.{player.isCaptain ? " The player is the team captain." : ""}</p>
      {hasKairosDbProfile("player", player.slug) && <p><a href={kairosDbPlayerUrl(player.slug)}>Competitive profile on KairosDB</a></p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>{null}</ArticleSection>
    <ArticleSection {...sections[2]!}>
      <PlayerTeamHistoryTable history={player.teamHistory} caption={`${player.nickname} team history`} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      {player.trivia.length ? <ul>{player.trivia.map((fact) => <li key={fact}>{fact}</li>)}</ul> : <p>No confirmed trivia recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="Individual awards" columns={["Date", "Award", "Tournament"]} empty="No confirmed individual awards recorded."
        rows={player.awards.map((award) => ({ key: award.id, cells: [formatDate(award.date), award.name, award.competitionName ?? "TBD"] }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {player.officialMatchCount === 0 && <p>No official matches recorded.</p>}
      <WikiTable caption={`${player.nickname} tournament results`} columns={["Date", "Place", "Tournament", "Team"]} empty="No confirmed tournament results recorded."
        rows={player.tournamentResults.map((result) => ({ key: result.id, cells: [
          formatDate(result.date), result.place ?? "TBD",
          <Link key="event" href={`/wiki/competitions/${result.competitionSlug}`}>{result.competitionName}</Link>,
          <ArticleLink key="team" href={result.teamSlug ? `/wiki/teams/${result.teamSlug}` : null}>{result.teamName}</ArticleLink>,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[6]!}>
      <details><summary>Sources ({[...player.sources, ...player.awards.flatMap((award) => award.sources)].filter((source, index, all) => all.findIndex((entry) => entry.id === source.id) === index).length})</summary>
        <SourceList sources={[...player.sources, ...player.awards.flatMap((award) => award.sources)].filter((source, index, all) => all.findIndex((entry) => entry.id === source.id) === index)} />
      </details>
      <details><summary>Episode appearances ({player.episodeAppearances.length})</summary><EpisodeReferenceList episodes={player.episodeAppearances} /></details>
    </ArticleSection>
  </WikiArticle>;
}
