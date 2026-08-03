import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Games" };

export default function GamesPage() {
  const catalog = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Games" },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title="Games"
        description="Game records define competitive vocabularies without assuming that Kairos is the center of every future event."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {catalog.games.map((game) => (
            <EntityCard
              key={game.id}
              href={`/wiki/games/${game.slug}`}
              kicker="Published game"
              title={game.name}
              description={`${game.activeTeamIds.length} active team and ${game.activePlayerIds.length} active players are currently published.`}
              meta={game.id}
            />
          ))}
        </div>
      </section>
    </>
  );
}
