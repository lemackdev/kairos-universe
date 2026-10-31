import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { ArticleInfobox, ArticleLink, ArticleSection, Facts, WikiArticle, WikiTable } from "./WikiArticle";
import { formatDate } from "@/lib/formatting/date";

const sections = [
  { id: "overview", title: "Overview" }, { id: "tournament-information", title: "Tournament Information" },
  { id: "prize-pool", title: "Prize Pool" }, { id: "participants", title: "Participants" },
  { id: "results", title: "Results" }, { id: "mvps", title: "MVPs" }, { id: "sources", title: "Sources" },
];

export function TournamentArticle({ tournament }: { tournament: CompetitionView }) {
  const information = [
    { label: "Game", value: tournament.gameName }, { label: "Organizer", value: tournament.organizer },
    { label: "Location", value: tournament.location }, { label: "Start date", value: formatDate(tournament.startDate) },
    { label: "End date", value: formatDate(tournament.endDate) }, { label: "Status", value: tournament.status },
  ];
  return <WikiArticle title={tournament.name} kind="Tournaments" game={tournament.gameName} sections={sections}
    infobox={<ArticleInfobox title={tournament.name} monogram={tournament.name.slice(0, 1)} groups={[
      { title: "Tournament Information", rows: information },
      { title: "Prize Pool", rows: [{ label: "Total", value: tournament.prizePool }] },
    ]} />}>
    <ArticleSection {...sections[0]!}>
      <p>{tournament.overview ?? "The tournament overview is not yet recorded."}</p>
      <h3>Format</h3>
      {tournament.format.length ? <ul>{tournament.format.map((rule) => <li key={rule}>{rule}</li>)}</ul> : <p>Format TBD.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}><Facts rows={information} /></ArticleSection>
    <ArticleSection {...sections[2]!}>
      <p>Total prize pool: <strong>{tournament.prizePool ?? "TBD"}</strong></p>
      <WikiTable caption="Prize distribution" columns={["Place", "Prize", "Team"]} empty="No confirmed prize distribution recorded."
        rows={tournament.prizes.map((prize, index) => ({ key: String(index), cells: [prize.place, prize.prize, prize.teamName] }))} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <WikiTable caption="Participants" columns={["Team"]} empty="No confirmed participants recorded."
        rows={tournament.participants.map((team) => ({ key: team.id, cells: [<Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>] }))} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="Tournament results" columns={["Place", "Team", "Date"]} empty="No confirmed results recorded."
        rows={tournament.results.map((result) => ({ key: result.id, cells: [result.place,
          <ArticleLink key="team" href={result.teamSlug ? `/wiki/teams/${result.teamSlug}` : null}>{result.teamName}</ArticleLink>, formatDate(result.date)] }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      <WikiTable caption="MVPs and individual awards" columns={["Award", "Recipient", "Date"]} empty="No MVPs or individual awards recorded."
        rows={tournament.awards.map((award) => ({ key: award.id, cells: [award.name,
          <ArticleLink key="recipient" href={award.recipientHref}>{award.recipientName}</ArticleLink>, formatDate(award.date)] }))} />
    </ArticleSection>
    <ArticleSection {...sections[6]!}><SourceList sources={tournament.sources} /></ArticleSection>
  </WikiArticle>;
}
