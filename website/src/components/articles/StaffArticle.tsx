import Link from "next/link";

import { SourceList } from "@/components/SourceList";
import { StaffPortrait } from "@/components/StaffPortrait";
import { NationalityFlags } from "@/components/NationalityFlags";
import { formatDate } from "@/lib/formatting/date";
import type { StaffView } from "@/types/catalog";
import { ArticleInfobox, ArticleSection, WikiArticle } from "./WikiArticle";

export function StaffArticle({ person }: { person: StaffView }) {
  const isAdrian = person.id === "adrian-elias-vale";
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "role", title: isAdrian ? "Leadership" : "Role and Responsibilities" },
    { id: "staff-history", title: "Staff History" },
    { id: "sources", title: "Sources" },
  ];
  const facts = [
    { label: "Name", value: person.realName },
    { label: "Nationality", value: <NationalityFlags nationality={person.nationality} nationalities={person.nationalities} /> },
    { label: "First appearance", value: person.firstAppearance ? `Episode ${person.firstAppearance.number}` : "TBD" },
  ];
  const roleFacts = [
    { label: "Role", value: person.role },
    { label: "Division", value: person.division },
    { label: "Organization", value: <Link href="/wiki/organizations/kairos-esports">Kairos Esports</Link> },
  ];

  return <WikiArticle title={person.nickname ?? person.realName} kind="Staff"
    game={person.division === "Executive" || person.division === "TBD" ? "Kairos Universe" : person.division} sections={sections}
    infobox={<ArticleInfobox title={person.displayName} monogram={person.realName.slice(0, 1)}
      image={<StaffPortrait id={person.id} />} groups={[
        { title: "Background Information", rows: facts },
        { title: "Position", rows: roleFacts },
      ]} />}>
    <ArticleSection {...sections[0]!}>
      {isAdrian
        ? <p><strong>Adrian Vale</strong> is the founder and CEO of Asterion Intelligence, the founder and owner of Kairos Esports, and the first-person narrator of the original episodes.</p>
        : <p><strong>{person.realName}</strong>{person.nickname ? `, known as ${person.nickname},` : ""} serves as {person.role} {person.division === "TBD" ? "at Kairos Esports." : `for the Kairos ${person.division} division.`}</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      {person.responsibilities.length
        ? <ul>{person.responsibilities.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        : <p>Detailed responsibilities remain TBD.</p>}
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      {person.tenures.length
        ? <ul className="articleTimeline">{person.tenures.map((entry) => <li key={entry.tenureId}>
            <strong>{entry.joinedDate ? formatDate(entry.joinedDate) : "—"}</strong> <span>{entry.realName} joins as {entry.title}.</span>
          </li>)}</ul>
        : <p>No structured staff-tenure dates are published.</p>}
    </ArticleSection>
    <ArticleSection id="sources" title="Sources"><details><summary>Sources ({person.sources.length})</summary><SourceList sources={person.sources} /></details></ArticleSection>
  </WikiArticle>;
}
