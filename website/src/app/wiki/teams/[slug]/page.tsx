import { notFound } from "next/navigation";
import Link from "next/link";
import { ReferenceNotice, Tier2TeamArticle } from "@/components/articles/ExternalArticles";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { getCatalog } from "@/lib/canon/server";
import { externalLogoPath } from "@/lib/externalLogos";
import { sceneTeamOrganizationLite, sceneTeamToTeamView } from "@/lib/external/teamView";
import { findRegionalStatus, findTier2Team, listAllTier2Teams } from "@/lib/external/worldState2027";
import { formatDate } from "@/lib/formatting/date";

export function generateStaticParams() {
  const catalog = getCatalog();
  const tier2Slugs = listAllTier2Teams(catalog.worldState2027).map((team) => ({ slug: team.teamId }));
  return [...catalog.teams, ...(catalog.externalScene?.teams ?? [])].map((team) => ({ slug: team.slug })).concat(tier2Slugs);
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const team = catalog.teams.find((entry) => entry.slug === slug);
  const reference = catalog.externalScene?.teams.find((entry) => entry.slug === slug);
  const tier2Team = !team && !reference ? findTier2Team(catalog.worldState2027, slug) : null;
  if (tier2Team) {
    const parent = tier2Team.parentTeamId ? catalog.externalScene?.teams.find((entry) => entry.id === tier2Team.parentTeamId) : undefined;
    return <Tier2TeamArticle team={tier2Team} parent={parent ? { name: parent.name, slug: parent.slug } : undefined} />;
  }
  if (!team && reference && catalog.externalScene) {
    const scene = catalog.externalScene;
    const event = scene.sources.find((s) => reference.sourceIds.includes(s.id))!;
    const logoPath = externalLogoPath(scene.organizations.find((o) => o.id === reference.organizationId)!.slug);
    const regionalStatus = findRegionalStatus(catalog.worldState2027, reference.id);
    const has2027Lineup = Boolean(catalog.worldState2027?.lcsRosters.teams.some((entry) => entry.teamId === reference.id));
    return <TeamArticle external
      team={sceneTeamToTeamView(reference, scene, catalog.worldState2027?.lcsRosters)}
      organization={sceneTeamOrganizationLite(reference, scene)}
      logo={logoPath && <img src={logoPath} alt={`${reference.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
      banner={has2027Lineup
        ? <p className="fictionNotice">The 2027 lineup reflects Kairos Universe continuity only, not these players’ real-world competitive, contractual, or employment status. 2026 observations are retained as history. <Link href="/wiki/world">Scope and source limitations</Link>.</p>
        : <ReferenceNotice />}
      overview={has2027Lineup
        ? <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) organization. Its 2027 starting lineup was confirmed as of {formatDate(catalog.worldState2027!.lcsRosters.confirmedBy)}; no signing dates or contract terms are established. The roster observed at the {event.title}, which ended {formatDate(event.eventEndDate)}, is retained as the 2026 reference. <Link href="/wiki/world">Scope and source limitations</Link>.</p>
        : <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) roster referenced in Kairospedia&rsquo;s pre-Worlds 2026 real-world reference collection. Roster membership reflects the {event.title}, which ended {formatDate(event.eventEndDate)}; it is not a live roster, a current contract list, or a Kairos narrative event. <Link href="/wiki/world">Scope and source limitations</Link>.</p>}
      extraFacts={regionalStatus ? [
        ...(catalog.worldState2027?.lcsRosters.teams.some((entry) => entry.teamId === reference.id) ? [{ label: "2027 starting lineup", value: `Confirmed ${formatDate(catalog.worldState2027.lcsRosters.confirmedBy)}` }] : []),
        { label: "2027 competitive status", value: regionalStatus.active ? `Active ${regionalStatus.league} 2027 participant` : "Inactive / not participating" },
        ...(regionalStatus.active ? [] : [
          { label: "Last active Tier 1 season", value: "2026" },
          { label: "Effective exit date", value: formatDate(regionalStatus.effectiveExitDate ?? null) },
        ]),
      ] : undefined}
    />;
  }
  if (!team) notFound();
  return <TeamArticle team={team} organization={catalog.organizations.find((entry) => entry.id === team.organizationId)} />;
}
