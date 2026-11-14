import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { BrandLogo } from "@/components/UniformPanel";
import { getCatalog } from "@/lib/canon/server";
import { externalLogoPath } from "@/lib/externalLogos";
import { csExternalTeams, csOrganizationSlugOf } from "@/lib/external/worldState2027";

export const metadata = { title: "Organizations" };

interface OrganizationEntry {
  id: string;
  name: string;
  slug: string;
  games: Set<string>;
  teams: number;
  kairos: boolean;
}

export default function OrganizationsPage() {
  const catalog = getCatalog();
  const worldState = catalog.worldState2027;
  const entries = new Map<string, OrganizationEntry>();

  for (const organization of catalog.organizations) {
    entries.set(organization.id, { id: organization.id, name: organization.name, slug: organization.slug, games: new Set(catalog.teams.filter((team) => team.organizationId === organization.id).map((team) => team.gameName)), teams: organization.teamIds.length, kairos: true });
  }
  for (const organization of catalog.externalScene?.organizations ?? []) {
    entries.set(organization.id, { id: organization.id, name: organization.name, slug: organization.slug, games: new Set(["League of Legends"]), teams: organization.teamIds.length, kairos: false });
  }
  const csOrganizations = new Map((worldState?.csExternalRosters.organizations ?? []).map((organization) => [organization.organizationId, organization]));
  for (const team of csExternalTeams(worldState)) {
    if (!team.organizationId) continue;
    const existing = entries.get(team.organizationId);
    if (existing) {
      existing.games.add("Counter-Strike");
      existing.teams += 1;
      continue;
    }
    const added = csOrganizations.get(team.organizationId);
    entries.set(team.organizationId, { id: team.organizationId, name: added?.name ?? team.name, slug: worldState ? csOrganizationSlugOf(worldState, team) : team.organizationId, games: new Set(["Counter-Strike"]), teams: 1, kairos: false });
  }

  const list = [...entries.values()].sort((a, b) => Number(b.kairos) - Number(a.kairos) || a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  return (
    <>
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Organizations" }]} />
      <PageHeader
        eyebrow={`${list.length} organizations`}
        title="Organizations"
        description="Parent businesses and esports brands are distinct from the competitive teams they operate. Kairos Esports comes first, followed by every League of Legends and Counter-Strike organization in the 2027 world."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {list.map((organization) => {
            const logo = organization.kairos ? <BrandLogo organizationId={organization.id} width={36} /> : externalLogoPath(organization.slug) ? <img src={externalLogoPath(organization.slug)!} alt="" /> : undefined;
            return (
              <EntityCard
                key={organization.id}
                href={`/wiki/organizations/${organization.slug}`}
                kicker={organization.kairos ? "Kairos organization" : "Organization"}
                title={organization.name}
                description={[...organization.games].sort().join(" · ") || "Organization"}
                meta={`${organization.teams} ${organization.teams === 1 ? "team" : "teams"}`}
                image={logo}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
