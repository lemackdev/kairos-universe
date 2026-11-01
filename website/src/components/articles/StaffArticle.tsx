import Link from "next/link";

import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { SourceList } from "@/components/SourceList";
import { StaffPortrait } from "@/components/StaffPortrait";
import { TenureTimeline } from "@/components/TenureTimeline";
import type { StaffView } from "@/types/catalog";
import { ArticleInfobox, ArticleSection, Facts, WikiArticle } from "./WikiArticle";

export function StaffArticle({ person }: { person: StaffView }) {
  const isAdrian = person.id === "adrian-elias-vale";
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "background-information", title: "Background Information" },
    { id: "role", title: isAdrian ? "Leadership" : "Role and Responsibilities" },
    { id: "staff-history", title: "Staff History" },
    { id: "episode-history", title: "Episode History" },
    { id: "sources", title: "Sources" },
  ];
  const facts = [
    { label: "Name", value: person.realName },
    { label: "Nationality", value: person.nationality ?? "TBD" },
    { label: "Status", value: person.status },
    { label: "First appearance", value: person.firstAppearance ? `Episode ${person.firstAppearance.number}` : "TBD" },
  ];
  const roleFacts = [
    { label: "Role", value: person.role },
    { label: "Division", value: person.division },
    { label: "Organization", value: <Link href="/wiki/organizations/kairos-esports">Kairos Esports</Link> },
  ];

  return <WikiArticle title={person.nickname ?? person.realName} kind="Staff"
    game={person.division === "Executive" ? "Kairos Universe" : person.division} sections={sections}
    infobox={<ArticleInfobox title={person.displayName} monogram={person.realName.slice(0, 1)}
      image={<StaffPortrait id={person.id} />} groups={[
        { title: "Background Information", rows: facts },
        { title: "Position", rows: roleFacts },
      ]} />}>
    <ArticleSection {...sections[0]!}>
      {isAdrian
        ? <p><strong>Adrian Vale</strong> is the founder and CEO of Asterion Intelligence, the founder and owner of Kairos Esports, and the first-person narrator of the original episodes.</p>
        : <p><strong>{person.realName}</strong>{person.nickname ? `, known as ${person.nickname},` : ""} serves as {person.role} in the fictional Kairos {person.division} project.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}><Facts rows={facts} /></ArticleSection>
    <ArticleSection {...sections[2]!}>
      <Facts rows={roleFacts} />
      {person.responsibilities.length
        ? <ul>{person.responsibilities.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        : <p>Detailed responsibilities remain TBD.</p>}
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      {person.tenures.length ? <TenureTimeline entries={person.tenures} /> : <p>No structured staff-tenure dates are published.</p>}
    </ArticleSection>
    <ArticleSection id="episode-history" title="Episode History">
      <h3>First appearance</h3>
      {person.firstAppearance ? <EpisodeReferenceList episodes={[person.firstAppearance]} /> : <p>TBD.</p>}
      <details><summary>Episode appearances ({person.episodeAppearances.length})</summary>
        <EpisodeReferenceList episodes={person.episodeAppearances} limit={12} />
      </details>
    </ArticleSection>
    <ArticleSection id="sources" title="Sources"><SourceList sources={person.sources} /></ArticleSection>
  </WikiArticle>;
}
