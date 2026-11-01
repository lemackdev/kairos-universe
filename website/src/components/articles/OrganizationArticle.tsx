import Link from "next/link";

import { ManagementTable } from "@/components/ManagementTable";
import { SourceList } from "@/components/SourceList";
import { BrandLogo } from "@/components/UniformPanel";
import type { OrganizationView, TeamView } from "@/types/catalog";
import { ArticleInfobox, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "organization-information", title: "Organization Information" },
  { id: "teams", title: "Teams" },
  { id: "leadership", title: "Leadership and Staff" },
  { id: "philosophy", title: "Philosophy" },
  { id: "sources", title: "Sources" },
];

export function OrganizationArticle({ organization, teams }: { organization: OrganizationView; teams: TeamView[] }) {
  const location = organization.headquarters;
  const headquarters = location ? [location.city, location.region, location.country].filter(Boolean).join(", ") : "TBD";
  const information = [
    { label: "Name", value: organization.name },
    { label: "Status", value: organization.status },
    { label: "Headquarters", value: headquarters },
    { label: "Founded", value: organization.founded ?? "TBD" },
    { label: "Owner", value: organization.ownerName && organization.ownerSlug
      ? <Link href={`/wiki/staff/${organization.ownerSlug}`}>{organization.ownerName}</Link>
      : organization.ownerName ?? "TBD" },
  ];

  return <WikiArticle title={organization.name} kind="Organizations" game="Kairos Universe" sections={sections}
    infobox={<ArticleInfobox title={organization.name} monogram={organization.shortName.slice(0, 1)}
      image={<BrandLogo organizationId={organization.id} />}
      groups={[{ title: "Organization Information", rows: information },
        { title: "Publication", rows: [{ label: "Published teams", value: teams.length }, { label: "Origin", value: organization.originType }] }]} />}>
    <ArticleSection {...sections[0]!}>
      <p><strong>{organization.name}</strong> is a fictional esports organization. Its game-specific teams are separate competitive records.</p>
      <p>Only divisions enabled for Kairospedia publication are listed here.</p>
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      <p>Headquarters: {headquarters}. Ownership and other known details appear in the infobox.</p>
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      <WikiTable caption="Published teams" columns={["Team", "Game", "Level", "Competitive state"]}
        empty="No teams published." rows={teams.map((team) => ({ key: team.id, cells: [
          <Link key="team" href={`/wiki/teams/${team.slug}`}>{team.name}</Link>,
          team.gameName, team.rosterLevel, team.competitiveState,
        ] }))} />
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <ManagementTable staff={organization.management} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      {organization.philosophy.length
        ? <ul>{organization.philosophy.map((principle) => <li key={principle}>{principle}</li>)}</ul>
        : <p>No philosophy statement recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[5]!}><SourceList sources={organization.sources} /></ArticleSection>
  </WikiArticle>;
}
