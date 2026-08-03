import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  const catalog = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Organizations" },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title="Organizations"
        description="Parent businesses and esports brands are distinct from the competitive teams they operate."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {catalog.organizations.map((organization) => (
            <EntityCard
              key={organization.id}
              href={`/wiki/organizations/${organization.slug}`}
              kicker={organization.originType}
              title={organization.name}
              description={`${organization.teamIds.length} team is enabled for this publication.`}
              meta={organization.id}
            />
          ))}
        </div>
      </section>
    </>
  );
}
