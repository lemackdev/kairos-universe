import { notFound } from "next/navigation";
import { TournamentArticle } from "@/components/articles/TournamentArticle";
import { getCatalog } from "@/lib/canon/server";
import { csExternalTeams, csOrganizationSlugOf, fieldCaptionFor, findTier2Team, regionalFieldFor } from "@/lib/external/worldState2027";
import { externalLogoPath } from "@/lib/externalLogos";
import { BrandLogo } from "@/components/UniformPanel";
import { competitionLogo } from "@/lib/competitionLogos";

const tier2LogoParentByTeamId: Record<string, string> = {
  "tier2-emea-masters-movistar-koi-fenix": "external-lol-team-movistar-koi",
  "tier2-emea-masters-g2-nord": "external-lol-team-g2-esports",
  "tier2-emea-masters-karmine-corp-blue": "external-lol-team-karmine-corp",
};

const tier2LogoSlugByTeamId: Record<string, string> = {
  "tier2-circuito-desafiante-estral-esports": "external-estral-esports",
  "tier2-circuito-desafiante-kabum-idl": "external-kabum-idl",
  "tier2-circuito-desafiante-vks-academy": "external-keyd-stars",
  "tier2-circuito-desafiante-intz": "external-intz",
  "tier2-circuito-desafiante-rmd-gaming": "external-rmd-gaming",
  "tier2-circuito-desafiante-ei-nerd-esports": "external-ei-nerd-esports",
  "tier2-circuito-desafiante-7rex": "external-7rex",
  "tier2-emea-masters-galions": "external-galions",
  "tier2-emea-masters-solary": "external-solary",
  "tier2-emea-masters-anubis-gaming": "external-anubis-gaming",
  "tier2-emea-masters-kaufland-hangry-knights": "external-kaufland-hangry-knights",
  "tier2-emea-masters-tln-pirates": "external-tln-pirates",
  "tier2-lcp-challengers-frank-esports": "external-frank-esports",
  "tier2-lcp-challengers-sillysilly-gaming": "external-sillysilly-gaming",
  "tier2-lcp-challengers-reignfall": "external-reignfall",
  "tier2-lcp-challengers-sponge-gaming": "external-sponge-gaming",
  "tier2-lcp-challengers-ewh": "external-embrace-whatever-happens",
  "tier2-lcp-challengers-rogersama": "external-rogersama",
};

function orgLogo(organizationSlug: string, teamName: string) {
  const path = externalLogoPath(organizationSlug);
  return path ? <img src={path} alt={`${teamName} logo`} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : undefined;
}

export function generateStaticParams() {
  return getCatalog().competitions.map((competition) => ({ slug: competition.slug }));
}
export default async function TournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const tournament = catalog.competitions.find((entry) => entry.slug === slug);
  if (!tournament) notFound();
  const field = regionalFieldFor(catalog.worldState2027, slug);
  const regionalField2027 = field?.map((team) => {
    const canonTeam = catalog.teams.find((entry) => entry.id === team.teamId);
    const externalTeam = catalog.externalScene?.teams.find((entry) => entry.id === team.teamId);
    const tier2Team = findTier2Team(catalog.worldState2027, team.teamId);
    const tier2ParentId = tier2Team?.parentTeamId ?? tier2LogoParentByTeamId[team.teamId];
    const tier2Parent = tier2ParentId ? catalog.externalScene?.teams.find((entry) => entry.id === tier2ParentId) : undefined;
    const csTeam = csExternalTeams(catalog.worldState2027).find((entry) => entry.teamId === team.teamId);
    const href = canonTeam ? `/wiki/teams/${canonTeam.slug}` : externalTeam ? `/wiki/teams/${externalTeam.slug}` : csTeam ? `/wiki/teams/${csTeam.slug}` : team.teamId.startsWith("tier2-") ? `/wiki/teams/${team.teamId}` : null;
    const logo = canonTeam ? <BrandLogo organizationId={canonTeam.organizationId} width={56} />
      : externalTeam ? (() => {
        const org = catalog.externalScene?.organizations.find((entry) => entry.id === externalTeam.organizationId);
        return org ? orgLogo(org.slug, team.name) : undefined;
      })() : tier2Parent ? (() => {
        const org = catalog.externalScene?.organizations.find((entry) => entry.id === tier2Parent.organizationId);
        return org ? orgLogo(org.slug, team.name) : undefined;
      })() : tier2LogoSlugByTeamId[team.teamId] ? orgLogo(tier2LogoSlugByTeamId[team.teamId], team.name)
      : csTeam && catalog.worldState2027 ? (() => {
        return orgLogo(csOrganizationSlugOf(catalog.worldState2027!, csTeam), team.name);
      })() : undefined;
    const logoTone = ["external-fluxo-w7m", "external-furia", "external-team-liquid"].includes(externalTeam?.slug ?? "")
      ? "dark" as const
      : undefined;
    return { name: team.name, href, logo, logoTone };
  });
  return <TournamentArticle tournament={tournament} regionalField2027={regionalField2027} fieldCaption={fieldCaptionFor(catalog.worldState2027, slug)} logo={competitionLogo(slug, tournament.name)} />;
}

