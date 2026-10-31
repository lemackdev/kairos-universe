import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/UniformPanel";
import { ExternalOrganizationArticle } from "@/components/articles/ExternalArticles";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, StatusBadge } from "@/components/Badges";
import { EntityCard } from "@/components/EntityCard";
import { EntityInfobox } from "@/components/EntityInfobox";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  const catalog = getCatalog();
  return [...catalog.organizations, ...(catalog.externalScene?.organizations ?? [])].map((organization) => ({
    slug: organization.slug,
  }));
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const organization = catalog.organizations.find(
    (entry) => entry.slug === slug,
  );
  const reference = catalog.externalScene?.organizations.find((entry) => entry.slug === slug);
  if (!organization && reference && catalog.externalScene) return <ExternalOrganizationArticle organization={reference} scene={catalog.externalScene} />;
  if (!organization) notFound();

  const teams = catalog.teams.filter((team) =>
    organization.teamIds.includes(team.id),
  );
  const location = organization.headquarters;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Organizations", href: "/wiki/organizations" },
          { label: organization.name },
        ]}
      />
      <PageHeader
        eyebrow="Organization"
        title={organization.name}
        description="A fictional esports organization represented separately from its game-specific competitive teams."
        badges={
          <>
            <CanonBadge />
            <StatusBadge status={organization.status} />
          </>
        }
        compact
      />
      <div className="entityLayout">
        <div className="entityBody">
          <section className="contentSection" aria-labelledby="visual-identity-heading">
            <h2 id="visual-identity-heading">Visual Identity</h2>
            <BrandLogo organizationId={organization.id} />
            <p>Approved organization identity. The 2027 uniform appears on each published team page, separately from current competitive history.</p>
          </section>
          <section className="contentSection">
            <h2>Published divisions</h2>
            <p className="muted">
              Only divisions intentionally enabled by the publication manifest
              appear here.
            </p>
            <div className="entityGrid">
              {teams.map((team) => (
                <EntityCard
                  key={team.id}
                  href={`/wiki/teams/${team.slug}`}
                  kicker={team.gameName}
                  title={team.name}
                  description={team.competitiveState}
                  meta={team.rosterLevel}
                />
              ))}
            </div>
          </section>
          <section className="contentSection">
            <h2>Operating philosophy</h2>
            <ul className="entityList">
              {organization.philosophy.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </section>
          <section className="contentSection">
            <h2>Sources</h2>
            <SourceList sources={organization.sources} />
          </section>
        </div>
        <EntityInfobox
          title={organization.name}
          monogram="K"
          image={<BrandLogo organizationId={organization.id} />}
          rows={[
            { label: "ID", value: organization.id },
            { label: "Origin", value: organization.originType },
            { label: "Status", value: organization.status },
            {
              label: "Headquarters",
              value: location
                ? `${location.city}, ${location.region}, ${location.country}`
                : "Unknown",
            },
            { label: "Published teams", value: organization.teamIds.length },
          ]}
        />
      </div>
    </>
  );
}
