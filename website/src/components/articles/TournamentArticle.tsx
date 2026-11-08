import type { ReactNode } from "react";
import Link from "next/link";
import type { CompetitionView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { ArticleInfobox, ArticleLink, ArticleSection, Facts, ParticipantsGrid, WikiArticle, WikiTable } from "./WikiArticle";
import { formatDate } from "@/lib/formatting/date";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "prize-pool", title: "Prize Pool" }, { id: "participants", title: "Participants" },
  { id: "results", title: "Results" }, { id: "mvps", title: "MVPs" },
  { id: "game-rules", title: "Game-Specific Rules" }, { id: "related-events", title: "Related Events" },
  { id: "event-data", title: "Event Data" }, { id: "sources", title: "Sources" },
];

const tierLabels: Record<string, string> = {
  premier: "Premier", major: "Major", "tier-2": "Tier 2",
  "tier-1-international": "Tier 1 International", "tier-2-international": "Tier 2 International",
  "world-championship": "World Championship", "tier-2-world-championship": "Tier 2 World Championship",
  "regional-tier-1": "Regional Tier 1", "regional-tier-2": "Regional Tier 2",
  "postseason-international": "Postseason International",
};

export function TournamentArticle({ tournament, regionalField2027, fieldCaption = "Participants (2027)" }: { tournament: CompetitionView; regionalField2027?: Array<{ name: string; href: string | null; logo?: ReactNode }>; fieldCaption?: string }) {
  const tierLabel = tournament.tier ? tierLabels[tournament.tier] ?? tournament.tier : null;
  const information = [
    { label: "Game", value: tournament.gameName },
    { label: "Organizer", value: tournament.organizerName ?? tournament.organizer },
    { label: "Series", value: tournament.seriesName },
    { label: "Tier", value: tierLabel },
    { label: "Region", value: tournament.region },
    { label: "Location", value: tournament.location }, { label: "LAN / Online", value: tournament.eventType },
    { label: "Start date", value: formatDate(tournament.startDate) },
    { label: "End date", value: formatDate(tournament.endDate) },
    { label: "Teams", value: tournament.teamsCount != null ? String(tournament.teamsCount) : null },
  ];
  return <WikiArticle title={tournament.name} kind="Tournaments" game={tournament.gameName} sections={sections}
    infobox={<ArticleInfobox title={tournament.name} monogram={tournament.name.slice(0, 1)} groups={[
      { title: "Tournament Information", rows: information },
      { title: "Prize Pool", rows: [{ label: "Total", value: tournament.prizePool }] },
    ]} />}>
    <ArticleSection {...sections[0]!}>
      {tournament.kairosParticipating && <p><strong>KAIROS PARTICIPATING</strong></p>}
      <p>{tournament.overview ?? "The tournament overview is not yet recorded."}</p>
      <h3>Format</h3>
      {tournament.format.length ? <ul>{tournament.format.map((rule) => <li key={rule}>{rule}</li>)}</ul> : <p>Format TBD.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <p>Total prize pool: <strong>{tournament.prizePool ?? "TBD"}</strong></p>
      <WikiTable caption="Prize distribution" columns={["Place", "Prize", "Team"]} empty="No confirmed prize distribution recorded."
        rows={tournament.prizes.map((prize, index) => ({ key: String(index), cells: [prize.place, prize.prize, prize.teamName] }))} />
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      {regionalField2027 ? <>
        <ParticipantsGrid caption={fieldCaption} empty="No active teams recorded."
          columns={4}
          teams={regionalField2027.map((team, index) => ({ key: String(index), name: team.name, href: team.href, logo: team.logo }))} />
      </> : <ParticipantsGrid caption="Participants" empty="No confirmed participants recorded."
        teams={tournament.participants.map((team) => ({ key: team.id, name: team.name, href: `/wiki/teams/${team.slug}` }))} />}
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <WikiTable caption="Tournament results" columns={["Place", "Team", "Date"]} empty="No confirmed results recorded."
        rows={tournament.results.map((result) => ({ key: result.id, cells: [result.place,
          <ArticleLink key="team" href={result.teamSlug ? `/wiki/teams/${result.teamSlug}` : null}>{result.teamName}</ArticleLink>, formatDate(result.date)] }))} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="MVPs and individual awards" columns={["Award", "Recipient", "Date"]} empty="No MVPs or individual awards recorded."
        rows={tournament.awards.map((award) => ({ key: award.id, cells: [award.name,
          <ArticleLink key="recipient" href={award.recipientHref}>{award.recipientName}</ArticleLink>, formatDate(award.date)] }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {tournament.gameName === "Counter-Strike"
        ? (tournament.mapPool.length
          ? <><p>Map pool (global, permanent, non-rotating):</p><ul>{tournament.mapPool.map((map) => <li key={map}>{map}</li>)}</ul></>
          : <p>Map pool not yet recorded.</p>)
        : <p>Patch: TBD. Fearless draft, side selection, and ruleset details are not yet recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[6]!}>
      {tournament.relatedEvents.length
        ? <ul>{tournament.relatedEvents.map((event) => <li key={event.slug}>
            <Link href={`/wiki/competitions/${event.slug}`}>{event.name}</Link></li>)}</ul>
        : <p>No related events recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[7]!}>
      <Facts rows={[
        { label: "Invite date", value: formatDate(tournament.inviteDate) },
        { label: "Ranking date", value: formatDate(tournament.rankingDate) },
      ]} />
    </ArticleSection>
    <ArticleSection {...sections[8]!}><details><summary>Sources ({tournament.sources.length})</summary><SourceList sources={tournament.sources} /></details></ArticleSection>
  </WikiArticle>;
}
