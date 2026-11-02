import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";
import { BrandLogo } from "@/components/UniformPanel";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  const catalog = getCatalog();
  const gameOrder = catalog.games.map((game) => game.name);
  const teamsByGame = new Map<string, typeof catalog.teams>();
  for (const team of catalog.teams) {
    const list = teamsByGame.get(team.gameName) ?? [];
    list.push(team);
    teamsByGame.set(team.gameName, list);
  }
  const games = [...teamsByGame.keys()].sort(
    (a, b) => gameOrder.indexOf(a) - gameOrder.indexOf(b),
  );

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
      {games.map((gameName) => (
        <section className="contentSection" key={gameName}>
          <h2 className="sectionKicker">{gameName}</h2>
          <div className="entityGrid">
            {teamsByGame.get(gameName)!.map((team) => (
              <EntityCard
                key={team.id}
                href={`/wiki/teams/${team.slug}`}
                kicker={team.gameName}
                title={team.name}
                description={team.competitiveState}
                meta={`${team.roster.length} active players`}
                image={<BrandLogo organizationId={team.organizationId} width={36} />}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
