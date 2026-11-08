import { notFound } from "next/navigation";
import { TournamentArticle } from "@/components/articles/TournamentArticle";
import { getCatalog } from "@/lib/canon/server";
import { csExternalTeams, csOrganizationSlugOf, fieldCaptionFor, regionalFieldFor } from "@/lib/external/worldState2027";
import { externalLogoPath } from "@/lib/externalLogos";
import { BrandLogo } from "@/components/UniformPanel";

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
    const csTeam = csExternalTeams(catalog.worldState2027).find((entry) => entry.teamId === team.teamId);
    const href = canonTeam ? `/wiki/teams/${canonTeam.slug}` : externalTeam ? `/wiki/teams/${externalTeam.slug}` : csTeam ? `/wiki/teams/${csTeam.slug}` : team.teamId.startsWith("tier2-") ? `/wiki/teams/${team.teamId}` : null;
    const logo = canonTeam ? <BrandLogo organizationId={canonTeam.organizationId} width={56} />
      : externalTeam ? (() => {
        const org = catalog.externalScene?.organizations.find((entry) => entry.id === externalTeam.organizationId);
        return org ? orgLogo(org.slug, team.name) : undefined;
      })() : csTeam && catalog.worldState2027 ? (() => {
        return orgLogo(csOrganizationSlugOf(catalog.worldState2027!, csTeam), team.name);
      })() : undefined;
    const logoTone = ["external-fluxo-w7m", "external-furia", "external-team-liquid"].includes(externalTeam?.slug ?? "")
      ? "dark" as const
      : undefined;
    return { name: team.name, href, logo, logoTone };
  });
  return <TournamentArticle tournament={tournament} regionalField2027={regionalField2027} fieldCaption={fieldCaptionFor(catalog.worldState2027, slug)} />;
}
