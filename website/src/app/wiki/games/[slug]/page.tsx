import { notFound } from "next/navigation";
import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, GameBadge, StatusBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { EntityCard } from "@/components/EntityCard";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  return getCatalog().games.map((game) => ({ slug: game.slug }));
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const game = catalog.games.find((entry) => entry.slug === slug);
  if (!game) notFound();

  const teams = catalog.teams.filter((team) =>
    game.activeTeamIds.includes(team.id),
  );
  const players = catalog.players.filter((player) =>
    game.activePlayerIds.includes(player.id),
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Games", href: "/wiki/games" },
          { label: game.name },
        ]}
      />
      <PageHeader
        eyebrow="Game record"
        title={game.name}
        description="Kairos narrative canon and the separately labeled pre-Worlds 2026 real-world reference scene."
        badges={
          <>
            <CanonBadge />
            <GameBadge game={game.name} />
            <StatusBadge status="active-publication" />
          </>
        }
        compact
      />
      <section className="contentSection" id="overview">
        <p><Link href="/wiki/world">Explore LCK, LPL, LEC, CBLOL, LCS, LCP and NACL tournament-roster references</Link>. These historical real-world records do not change fictional canon.</p>
        <div className="sectionHeader">
          <div>
            <span className="sectionKicker">Overview</span>
            <h2>Published competitive record</h2>
          </div>
          <p>
            Role vocabulary is derived from the active published roster. No
            external league structure is fabricated.
          </p>
        </div>
        <div className="statusRow">
          {game.roleVocabulary.map((role) => (
            <span className="badge badgeRole" key={role}>
              {role}
            </span>
          ))}
        </div>
      </section>
      <section className="contentSection" id="teams">
        <h2>Active Kairos canon teams</h2>
        <div className="entityGrid">
          {teams.map((team) => (
            <EntityCard
              key={team.id}
              href={`/wiki/teams/${team.slug}`}
              kicker={team.rosterLevel}
              title={team.name}
              description={team.competitiveState}
              meta={team.intendedCompetition}
            />
          ))}
        </div>
      </section>
      <section className="contentSection" id="players">
        <h2>Active Kairos canon players</h2>
        <div className="entityGrid">
          {players.map((player) => (
            <EntityCard
              key={player.id}
              href={`/wiki/players/${player.slug}`}
              kicker={player.role}
              title={player.nickname}
              description={player.realName}
              meta={player.currentTeamName}
            />
          ))}
        </div>
      </section>
      <section className="contentSection" id="competitions">
        <h2>Future competitions</h2>
        <EmptyState
          title="Participation is planned, not recorded"
          description={`The team's intended competition remains an intention. The next competitive milestone is ${catalog.metadata.nextCompetitiveMilestone}, with no exact debut date or competition record published.`}
        />
      </section>
      <section className="contentSection" id="matches">
        <h2>Matches</h2>
        <EmptyState
          title="No official matches recorded"
          description="Practice and private activity are kept separate from official match history. No official League match is present in this release."
        />
      </section>
      <section className="contentSection">
        <h2>Latest relevant canon updates</h2>
        <EpisodeReferenceList episodes={game.latestEpisodes} />
      </section>
    </>
  );
}
