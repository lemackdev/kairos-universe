import Link from "next/link";
import Image from "next/image";
import { BrandLogo, UniformPanel } from "@/components/UniformPanel";
import { TeamRosterTable } from "@/components/TeamRosterTable";
import type { OrganizationView, TeamView } from "@/types/catalog";
import { SourceList } from "@/components/SourceList";
import { ManagementTable } from "@/components/ManagementTable";
import { hasKairosDbProfile, kairosDbTeamUrl } from "@/lib/links";
import { formatDate } from "@/lib/formatting/date";
import { ArticleInfobox, ArticleLink, ArticleSection, WikiArticle, WikiTable } from "./WikiArticle";

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
  const label = [location.city, location.region, location.country].filter((part) => part && part !== "TBD").join(", ") || "TBD";
  return <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
    {code && <Image src={`/flags/${code}.png`} width={24} height={18} unoptimized alt="" />}
    {label}
  </span>;
}

export function TeamArticle({ team, organization }: { team: TeamView; organization?: OrganizationView }) {
  const region = northAmerica.has(team.trainingLocation.country) ? "North America" : team.trainingLocation.country;
  const facts = [
    { label: "Org Location", value: organization ? locationWithFlag(organization.headquarters ?? team.trainingLocation) : "TBD" },
    { label: "Team Location", value: locationWithFlag(team.trainingLocation) },
    { label: "Region", value: region },
    { label: "Owner", value: organization?.ownerName
      ? (organization.ownerSlug ? <Link href={`/wiki/staff/${organization.ownerSlug}`}>{organization.ownerName}</Link> : organization.ownerName)
      : "TBD" },
    { label: "Head Coach", value: team.headCoachName ?? "TBD" },
    { label: "Partner", value: "Asterion Intelligence" },
  ];
  const historyFacts = [
    { label: "Founded", value: organization?.founded ?? "TBD" },
  ];
  return <WikiArticle title={team.name} game={team.gameName} kind="Teams" sections={sections}
    infobox={<ArticleInfobox title={team.shortName} monogram={team.shortName.slice(0, 1)} image={organization && <BrandLogo organizationId={organization.id} />} groups={[
      { title: "Team Information", rows: facts },
      { title: "History", rows: historyFacts },
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
      {team.transactions.length
        ? <ul className="articleTimeline">{team.transactions.map((entry) => <li key={entry.id}>
            <strong>{entry.date ? formatDate(entry.date) : "Date TBD"}</strong> <span>{entry.text}</span>
          </li>)}</ul>
        : <p>No roster or staff transactions recorded.</p>}
    </ArticleSection>
    <ArticleSection {...sections[3]!}>
      <h3>Active</h3>
      <TeamRosterTable roster={team.roster} caption={`${team.shortName} active roster`} />
    </ArticleSection>
    <ArticleSection {...sections[4]!}>
      <WikiTable caption="Former players" columns={["Player", "Name", "Role", "Joined", "Left"]}
        empty="No former players recorded." rows={team.formerRoster.map((player) => ({
          key: player.tenureId, cells: [<ArticleLink key="link" href={`/wiki/players/${player.slug}`}>{player.nickname}</ArticleLink>,
            player.realName, player.role, formatDate(player.joinedDate), formatDate(player.leftDate)],
        }))} />
    </ArticleSection>
    <ArticleSection {...sections[5]!}>
      {organization && <p><Link href={`/wiki/organizations/${organization.slug}`}>{organization.name}</Link></p>}
      <h3>Management and staff</h3>
      <ManagementTable staff={(organization?.management ?? []).filter(
        (person) => person.division === team.gameName || person.division === "TBD" || person.division === "Executive",
      )} />
    </ArticleSection>
    <ArticleSection {...sections[6]!}><UniformPanel teamId={team.id} /></ArticleSection>
    <ArticleSection {...sections[7]!}>
      <details><summary>Sources ({team.sources.length})</summary><SourceList sources={team.sources} /></details>
    </ArticleSection>
  </WikiArticle>;
}
