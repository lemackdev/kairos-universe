import { notFound } from "next/navigation";
import Link from "next/link";
import { CsTeamArticle, Tier2TeamArticle } from "@/components/articles/ExternalArticles";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { getCatalog } from "@/lib/canon/server";
import { externalLogoPath } from "@/lib/externalLogos";
import { sceneTeamOrganizationLite, sceneTeamToTeamView } from "@/lib/external/teamView";
import { csExternalTeams, findRegionalStatus, findTier2Team, listAllTier2Teams, rosterSets } from "@/lib/external/worldState2027";
import { formatDate } from "@/lib/formatting/date";

export function generateStaticParams() {
  const catalog = getCatalog();
  const tier2Slugs = listAllTier2Teams(catalog.worldState2027).map((team) => ({ slug: team.teamId }));
  const csSlugs = csExternalTeams(catalog.worldState2027).map((team) => ({ slug: team.slug }));
  return [...catalog.teams, ...(catalog.externalScene?.teams ?? [])].map((team) => ({ slug: team.slug })).concat(tier2Slugs, csSlugs);
}

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const team = catalog.teams.find((entry) => entry.slug === slug);
  const reference = catalog.externalScene?.teams.find((entry) => entry.slug === slug);
  const csTeam = !team && !reference ? csExternalTeams(catalog.worldState2027).find((entry) => entry.slug === slug) : undefined;
  if (csTeam && catalog.worldState2027) return <CsTeamArticle team={csTeam} worldState={catalog.worldState2027} />;
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
    const sets2027 = rosterSets(catalog.worldState2027);
    const lineupSet = sets2027.find((set) => set.teams.some((entry) => entry.teamId === reference.id));
    const has2027Lineup = Boolean(lineupSet);
    const vacancies2027 = sets2027.flatMap((set) => set.vacancies).filter((entry) => entry.teamId === reference.id);
    const pending2027 = sets2027.flatMap((set) => set.pendingIdentities ?? []).filter((entry) => entry.teamId === reference.id);
    return <TeamArticle external
      team={sceneTeamToTeamView(reference, scene, sets2027)}
      organization={sceneTeamOrganizationLite(reference, scene)}
      logo={logoPath && <img src={logoPath} alt={`${reference.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
      overview={has2027Lineup
        ? <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) organization. Its 2027 starting lineup was confirmed {lineupSet!.confirmedBy ? <>as of {formatDate(lineupSet!.confirmedBy)}</> : <>in the January 2027 reconstruction period (exact date not established)</>}; no signing dates or contract terms are established. The roster observed at the {event.title}, which ended {formatDate(event.eventEndDate)}, is retained as the 2026 reference. <Link href="/wiki/world">Scope and source limitations</Link>.</p>
        : <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) roster referenced in Kairospedia&rsquo;s pre-Worlds 2026 real-world reference collection. Roster membership reflects the {event.title}, which ended {formatDate(event.eventEndDate)}; it is not a live roster, a current contract list, or a Kairos narrative event. <Link href="/wiki/world">Scope and source limitations</Link>.</p>}
      extraFacts={regionalStatus ? [
        ...(vacancies2027.length
          ? [{ label: "2027 vacant positions", value: vacancies2027.map((entry) => entry.role).join(", ") + " (replacements not yet confirmed)" }] : []),
        ...(pending2027.length
          ? [{ label: "2027 pending identities", value: pending2027.map((entry) => `${entry.role}: ${entry.nickname}`).join(", ") + " (profile awaiting author approval)" }] : []),
        ...(lineupSet ? [{ label: "2027 starting lineup", value: lineupSet.confirmedBy ? `Confirmed ${formatDate(lineupSet.confirmedBy)}` : "Confirmed (January 2027, exact date not established)" }] : []),
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
