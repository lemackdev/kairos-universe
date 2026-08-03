import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Players" };

export default function PlayersPage() {
  const catalog = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Players" },
        ]}
      />
      <PageHeader
        eyebrow="Global catalog"
        title="Players"
        description="Current profiles calculate age at the Kairos narrative date and preserve historical aliases without replacing canonical nicknames."
        compact
      />
      <section className="contentSection">
        <div className="entityGrid">
          {catalog.players.map((player) => (
            <EntityCard
              key={player.id}
              href={`/wiki/players/${player.slug}`}
              kicker={player.role}
              title={player.nickname}
              description={player.realName}
              meta={player.isCaptain ? "Captain" : player.currentTeamName}
            />
          ))}
        </div>
      </section>
    </>
  );
}
