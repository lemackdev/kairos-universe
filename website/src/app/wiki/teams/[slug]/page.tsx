import { notFound } from "next/navigation";
import Link from "next/link";
import { CsTeamArticle } from "@/components/articles/ExternalArticles";
import { TeamArticle } from "@/components/articles/TeamArticle";
import { getCatalog } from "@/lib/canon/server";
import { externalLogoPath } from "@/lib/externalLogos";
import { sceneTeamOrganizationLite, sceneTeamToTeamView, tier2TeamToTeamView } from "@/lib/external/teamView";
import { tier2LogoOrgSlug } from "@/lib/tier2Logos";
import { csExternalTeams, csOrganizationSlugOf, findRegionalStatus, findTier2Team, legalNameOf, listAllTier2Teams, nationalitiesOf, organizationOverviewOf, regionCodeOfLeague, rosterSets } from "@/lib/external/worldState2027";
import { formatDate } from "@/lib/formatting/date";
import type { RosterEntryView } from "@/types/catalog";

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
  if (csTeam && catalog.worldState2027) {
    const logoPath = externalLogoPath(csOrganizationSlugOf(catalog.worldState2027, csTeam));
    return <CsTeamArticle team={csTeam} worldState={catalog.worldState2027} logo={logoPath ? <img src={logoPath} alt={`${csTeam.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : undefined} />;
  }
  const tier2Team = !team && !reference ? findTier2Team(catalog.worldState2027, slug) : null;
  if (tier2Team) {
    const parent = tier2Team.parentTeamId ? catalog.externalScene?.teams.find((entry) => entry.id === tier2Team.parentTeamId) : undefined;
    const lineup = rosterSets(catalog.worldState2027).flatMap((set) => set.teams).find((entry) => entry.teamId === tier2Team.teamId);
    const addedPlayers = new Map(rosterSets(catalog.worldState2027).flatMap((set) => set.addedPlayers).map((player) => [player.playerId, player]));
    const roster: RosterEntryView[] | undefined = lineup?.starters.flatMap((starter) => {
      const added = addedPlayers.get(starter.playerId);
      const slug = added?.slug ?? catalog.externalScene?.players.find((player) => player.id === starter.playerId)?.slug;
      if (!slug) return [];
      const nationalities = nationalitiesOf(catalog.worldState2027, starter.playerId, tier2Team.ecosystem, added?.nationality);
      return [{
        nationality: nationalities[0] ?? null, nationalities, regionCode: regionCodeOfLeague(catalog.worldState2027, tier2Team.ecosystem), tenureId: `${tier2Team.teamId}-${starter.playerId}-2027`, playerId: starter.playerId, slug,
        realName: legalNameOf(catalog.worldState2027, starter.playerId, added?.legalName) ?? "TBD", nickname: starter.nickname, role: starter.role, rosterStatus: "active", isCaptain: false, isStarter: true,
        joinedDate: null, leftDate: null, contractEndDate: null, teamId: tier2Team.teamId, teamName: tier2Team.name, teamSlug: tier2Team.teamId,
      }];
    });
    const scene = catalog.externalScene;
    const logoSlug = tier2LogoOrgSlug(scene, tier2Team);
    const logoPath = logoSlug ? externalLogoPath(logoSlug) : null;
    return <TeamArticle external
      team={tier2TeamToTeamView(tier2Team, roster ?? [], parent?.organizationId ?? "")}
      organization={parent && scene ? sceneTeamOrganizationLite(parent, scene) : undefined}
      logo={logoPath ? <img src={logoPath} alt={`${tier2Team.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : undefined}
      overview={organizationOverviewOf(catalog.worldState2027, parent?.organizationId, tier2Team.teamId) ? <p>{organizationOverviewOf(catalog.worldState2027, parent?.organizationId, tier2Team.teamId)}</p> : <p><strong>{tier2Team.name}</strong> competes in the {tier2Team.ecosystem} for the 2027 season, a Tier 2 regional ecosystem with eight confirmed participants. {parent ? <>It is recorded as a distinct competitive entity from its parent organization, <Link href={`/wiki/teams/${parent.slug}`}>{parent.name}</Link>, whose own Tier 1 membership and roster are tracked separately. </> : null}<Link href="/wiki/world">Scope and source limitations</Link>.</p>}
    />;
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
      team={sceneTeamToTeamView(reference, scene, sets2027, catalog.worldState2027)}
      organization={sceneTeamOrganizationLite(reference, scene)}
      logo={logoPath && <img src={logoPath} alt={`${reference.name} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />}
      overview={organizationOverviewOf(catalog.worldState2027, reference.organizationId)
        ? <p>{organizationOverviewOf(catalog.worldState2027, reference.organizationId)}</p>
        : has2027Lineup
        ? <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) organization. Its 2027 starting lineup was confirmed {lineupSet!.confirmedBy ? <>as of {formatDate(lineupSet!.confirmedBy)}</> : <>in the January 2027 reconstruction period (exact date not established)</>}; no signing dates or contract terms are established. The roster observed at the {event.title}, which ended {formatDate(event.eventEndDate)}, is retained as the 2026 reference. <Link href="/wiki/world">Scope and source limitations</Link>.</p>
        : <p><strong>{reference.name}</strong> is a {reference.league} ({reference.region}) roster referenced in Kairospedia&rsquo;s pre-Worlds 2026 real-world reference collection. Roster membership reflects the {event.title}, which ended {formatDate(event.eventEndDate)}; it is not a live roster, a current contract list, or a Kairos narrative event. <Link href="/wiki/world">Scope and source limitations</Link>.</p>}
      extraFacts={regionalStatus ? [
        ...(vacancies2027.length
          ? [{ label: "2027 vacant positions", value: vacancies2027.map((entry) => entry.role).join(", ") + " (replacements not yet confirmed)" }] : []),
        ...(pending2027.length
          ? [{ label: "2027 pending identities", value: pending2027.map((entry) => `${entry.role}: ${entry.nickname}`).join(", ") + " (profile awaiting author approval)" }] : []),
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
