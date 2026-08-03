import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  CanonBadge,
  GameBadge,
  RoleBadge,
  StatusBadge,
} from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { EntityInfobox } from "@/components/EntityInfobox";
import { EntityLink } from "@/components/EntityLink";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { TenureTimeline } from "@/components/TenureTimeline";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  return getCatalog().players.map((player) => ({ slug: player.slug }));
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const player = catalog.players.find((entry) => entry.slug === slug);
  if (!player) notFound();

  const team = catalog.teams.find((entry) => entry.id === player.currentTeamId);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Players", href: "/wiki/players" },
          { label: player.nickname },
        ]}
      />
      <PageHeader
        eyebrow="Player record"
        title={player.nickname}
        description={`${player.realName} is the current ${player.role} for ${player.currentTeamName}. This profile contains only confirmed structured facts.`}
        badges={
          <>
            <CanonBadge />
            <GameBadge game={player.gameName} />
            <RoleBadge role={player.role} />
            <StatusBadge status={player.status} />
          </>
        }
        compact
      />
      <div className="entityLayout">
        <div className="entityBody">
          <section className="contentSection">
            <h2>Current team</h2>
            {team ? (
              <EntityLink
                href={`/wiki/teams/${team.slug}`}
                name={team.name}
                detail={player.isCaptain ? "Current captain" : player.role}
              />
            ) : (
              "Unknown"
            )}
          </section>

          <section className="contentSection">
            <h2>Team history</h2>
            <TenureTimeline entries={player.teamHistory} />
            <p className="muted">
              Exact join dates remain TBD. No previous professional team is
              inferred.
            </p>
          </section>

          <section className="contentSection">
            <h2>Mentorship</h2>
            {player.mentor ? (
              <div className="featureCard">
                <span className="sectionKicker">{player.mentor.role}</span>
                <h3>
                  {player.mentor.nickname ?? player.mentor.name}
                </h3>
                <p className="muted">
                  Confirmed role mentorship. The mentor is a real-world esports
                  figure appearing in a fictional Kairos role.
                </p>
              </div>
            ) : (
              <EmptyState
                title="No mentorship record"
                description="No confirmed mentorship relationship is published for this player."
              />
            )}
          </section>

          <section className="contentSection">
            <h2>First appearance</h2>
            {player.firstAppearance ? (
              <EpisodeReferenceList episodes={[player.firstAppearance]} />
            ) : (
              "TBD"
            )}
          </section>

          <section className="contentSection">
            <h2>Episode appearances</h2>
            <EpisodeReferenceList
              episodes={player.episodeAppearances}
              limit={12}
            />
            {player.episodeAppearances.length > 12 ? (
              <p className="muted">
                Showing 12 of {player.episodeAppearances.length} structured
                appearances.
              </p>
            ) : null}
          </section>

          <section className="contentSection">
            <h2>Aliases and retcon notes</h2>
            {player.historicalAliases.length > 0 ? (
              <ul className="entityList">
                {player.historicalAliases.map((alias) => (
                  <li key={`${alias.nickname}-${alias.sourceEpisode}`}>
                    <strong>{alias.nickname}</strong>
                    <div className="sourceMeta">
                      {alias.status} · {alias.sourceEpisode}
                    </div>
                    <p className="muted">{alias.notes}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No historical aliases are recorded.</p>
            )}
          </section>

          <section className="contentSection">
            <h2>Match statistics</h2>
            <EmptyState
              title="No official statistics"
              description="No official Kairos League match has occurred. No KDA, win rate, record, ranking, or projection is published."
            />
          </section>

          <section className="contentSection">
            <h2>Sources</h2>
            <SourceList sources={player.sources} />
          </section>
        </div>

        <EntityInfobox
          title={player.displayName}
          monogram={player.nickname.slice(0, 1)}
          rows={[
            { label: "Stable ID", value: player.id },
            { label: "Role", value: player.role },
            { label: "Team", value: team?.shortName ?? "Unknown" },
            { label: "Captain", value: player.isCaptain ? "Yes" : "No" },
            { label: "Age", value: player.age ?? "Unknown" },
            {
              label: "Date of birth",
              value: player.dateOfBirth ?? "Unknown",
            },
            { label: "Nationality", value: player.nationality ?? "Unknown" },
            { label: "Canonical city", value: player.city ?? "Unknown" },
            {
              label: "First appearance",
              value: player.firstAppearance
                ? `Episode ${player.firstAppearance.number}`
                : "TBD",
            },
          ]}
        />
      </div>
    </>
  );
}
