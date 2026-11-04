import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";
import { BrandLogo } from "@/components/UniformPanel";
import { listAllTier2Teams } from "@/lib/external/worldState2027";

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
  const tier2Teams = listAllTier2Teams(catalog.worldState2027);
  const tier2ByEcosystem = new Map<string, typeof tier2Teams>();
  for (const team of tier2Teams) {
    const list = tier2ByEcosystem.get(team.ecosystem) ?? [];
    list.push(team);
    tier2ByEcosystem.set(team.ecosystem, list);
  }

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
      {tier2Teams.length > 0 && <section className="contentSection">
        <h2 className="sectionKicker">League of Legends &mdash; Tier 2 (2027)</h2>
        <p>Kairos Universe 2027 Tier 2 regional ecosystems. See <a href="/wiki/world">the competitive world</a> for sourcing and scope.</p>
        {[...tier2ByEcosystem.entries()].map(([ecosystem, teams]) => <div className="entityGrid" key={ecosystem}>
          {teams.map((team) => <EntityCard
            key={team.teamId}
            href={`/wiki/teams/${team.teamId}`}
            kicker={`League of Legends / ${ecosystem}`}
            title={team.name}
            description={team.region}
            meta="Tier 2"
          />)}
        </div>)}
      </section>}
    </>
  );
}
