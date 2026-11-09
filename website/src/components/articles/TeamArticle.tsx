import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo, UniformPanel } from "@/components/UniformPanel";
import { TeamRosterTable } from "@/components/TeamRosterTable";
import type { OrganizationView, TeamView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { ManagementTable } from "@/components/ManagementTable";
import { asterionUrl, hasKairosDbProfile, kairosDbTeamUrl } from "@/lib/links";
import { formatDate } from "@/lib/formatting/date";
import { ArticleInfobox, ArticleLink, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";
import { TeamLineupBanner } from "./TeamLineupBanner";

const sections = [
  { id: "history", title: "History" }, { id: "team-information", title: "Team Information" },
  { id: "timeline", title: "Timeline" }, { id: "player-roster", title: "Player Roster" },
  { id: "former", title: "Former" }, { id: "organization", title: "Organization" },
  { id: "uniform", title: "Uniform" }, { id: "sources", title: "Sources" },
];

const countryFlags: Record<string, string> = {
  "United States": "us", Canada: "ca", Mexico: "mx", Chile: "cl", Brazil: "br",
  "South Korea": "kr", Korea: "kr", China: "cn",
};
const northAmerica = new Set(["United States", "Canada"]);

function locationWithFlag(location: { city: string; region: string; country: string }) {
  const code = countryFlags[location.country];
  const label = [location.city, location.region, ...(northAmerica.has(location.country) ? [] : [location.country])]
    .filter((part) => part && part !== "TBD").join(", ") || "TBD";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
    {code && <Image src={`/flags/${code}.png`} width={24} height={18} unoptimized alt="" />}
    {label}
  </span>;
}

type TeamOrganization = Pick<OrganizationView, "id" | "slug" | "name" | "headquarters" | "ownerName" | "ownerSlug" | "founded" | "management">;

export function TeamArticle({ team, organization, banner, logo, overview, external, extraFacts }: {
  team: TeamView; organization?: TeamOrganization; banner?: ReactNode; logo?: ReactNode; overview?: ReactNode; external?: boolean;
  extraFacts?: Array<{ label: string; value: ReactNode }>;
}) {
  const region = northAmerica.has(team.trainingLocation.country) ? "NA" : team.trainingLocation.country;
  const facts = [
    { label: "Org Location", value: organization ? locationWithFlag(organization.headquarters ?? team.trainingLocation) : "TBD" },
    { label: "Team Location", value: locationWithFlag(team.trainingLocation) },
    { label: "Region", value: region },
    { label: "Owner", value: organization?.ownerName
      ? (organization.ownerSlug ? <Link href={`/wiki/staff/${organization.ownerSlug}`}>{organization.ownerName}</Link> : organization.ownerName)
      : "TBD" },
    { label: "Head Coach", value: team.headCoachName
      ? (team.headCoachSlug ? <Link href={`/wiki/staff/${team.headCoachSlug}`}>{team.headCoachName}</Link> : team.headCoachName)
      : "TBD" },
    ...(external ? [] : [
      { label: "Parent Company / Institutional Partner", value: (asterionUrl("/") ? <a href={asterionUrl("/")!}>Asterion Intelligence</a> : "Asterion Intelligence") as ReactNode },
      { label: "Technical Supplier", value: "New Balance" as ReactNode },
    ]),
    ...(extraFacts ?? []),
  ];
  const historyFacts = [
    { label: "Founded", value: organization?.founded ?? "TBD" },
  ];
  return <WikiArticle title={team.name} game={team.gameName} kind="Teams" sections={external ? sections.filter((section) => section.id !== "uniform") : sections} banner={banner}
    infobox={<ArticleInfobox title={team.shortName} monogram={team.shortName.slice(0, 1)} image={logo ?? (organization && <BrandLogo organizationId={organization.id} />)} groups={[
      { title: "Team Information", rows: facts },
      { title: "History", rows: historyFacts },
    ]} />}>
    {overview ?? <p><strong>{team.name}</strong> is the {team.gameName} {team.rosterLevel} roster of {organization?.name ?? "an organization yet to be published"}, a Los Angeles-based esports organization founded by Adrian Vale under parent company Asterion Intelligence. Rather than assembling the roster through a club acquisition, Kairos built it through its own player-development recruitment process, beginning in early 2026. The {team.gameName} division is intended to debut in the {team.intendedCompetition}, and as of {team.currentStoryPeriod} has not yet played an official match.</p>}
    <ArticleSection {...sections[0]!}>
      {team.history.length ? team.history.map((fact) => <p key={fact}>{fact}</p>) : <p>No team history is recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[1]!}>
      {team.officialMatchCount === 0 && <p>No official matches recorded.</p>}
      <p>Information current to {team.currentStoryPeriod}. Planned participation is subject to confirmation.</p>
      {hasKairosDbProfile("team", team.id) && <p><a href={kairosDbTeamUrl(team.slug)}>Competitive profile on KairosDB</a></p>}
    </ArticleSection>
    <ArticleSection {...sections[2]!}>
      {team.transactions.length
        ? <ul className="articleTimeline">{team.transactions.map((entry) => <li key={entry.id}>
            <strong>{entry.date ? formatDate(entry.date) : "—"}</strong> <span>{entry.text}</span>
          </li>)}</ul>
        : <p>No roster or staff transactions recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <h3>Active</h3>
      <TeamRosterTable roster={team.roster} caption={`${team.shortName} active roster`} showRegion={team.gameName !== "Counter-Strike"} />
      <TeamLineupBanner team={team} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <TeamRosterTable roster={team.formerRoster} caption={`${team.shortName} former players`} empty="No former players recorded." showRegion={team.gameName !== "Counter-Strike"} />
      {!external && <WikiTable caption="Former staff" columns={["Staff", "Name", "Former role", "Mentored"]}
        empty="No former staff recorded." rows={team.formerStaff.map((person) => ({
          key: person.id, cells: [<ArticleLink key="link" href={`/wiki/staff/${person.slug}`}>{person.name}</ArticleLink>,
            person.realName, person.role, person.playerNickname],
        }))} />}
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {organization && <p><Link href={`/wiki/organizations/${organization.slug}`}>{organization.name}</Link></p>}
      {!external && <>
        <h3>Management and staff</h3>
        <ManagementTable staff={(organization?.management ?? []).filter(
          (person) => !team.formerStaffIds.includes(person.id) && (
            person.division === "Executive"
            || team.assignedStaffIds.includes(person.id)
            || person.currentTeamId === team.id
            || (!person.currentTeamId && person.division === team.gameName)
          ),
        )} />
      </>}
    </ArticleSection>
    {!external && <ArticleSection {...sections[6]!}><UniformPanel teamId={team.id} /></ArticleSection>}
    <ArticleSection {...sections[7]!}>
      <details><summary>Sources ({team.sources.length})</summary><SourceList sources={team.sources} /></details>
    </ArticleSection>
  </WikiArticle>;
}
