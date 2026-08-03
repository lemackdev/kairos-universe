import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  const catalog = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Teams" },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title="Teams"
        description="A team is a game-specific competitive unit. It is never treated as interchangeable with its parent organization."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {catalog.teams.map((team) => (
            <EntityCard
              key={team.id}
              href={`/wiki/teams/${team.slug}`}
              kicker={team.gameName}
              title={team.name}
              description={team.competitiveState}
              meta={`${team.roster.length} active players`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
