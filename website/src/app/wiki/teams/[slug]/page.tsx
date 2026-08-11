import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, GameBadge, StatusBadge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { EntityInfobox } from "@/components/EntityInfobox";
import { EpisodeReferenceList } from "@/components/EpisodeReferenceList";
import { PageHeader } from "@/components/PageHeader";
import { SourceList } from "@/components/SourceList";
import { StaffTable } from "@/components/StaffTable";
import { TeamRosterTable } from "@/components/TeamRosterTable";
import { TenureTimeline } from "@/components/TenureTimeline";
import { getCatalog } from "@/lib/canon/server";
import { hasKairosDbProfile, kairosDbTeamUrl } from "@/lib/links";

export function generateStaticParams() {
  return getCatalog().teams.map((team) => ({ slug: team.slug }));
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalog();
  const team = catalog.teams.find((entry) => entry.slug === slug);
  if (!team) notFound();

  const organization = catalog.organizations.find(
    (entry) => entry.id === team.organizationId,
  );
  const captain = team.roster.find(
    (entry) => entry.playerId === team.captainPlayerId,
  );
  const location = team.trainingLocation;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Teams", href: "/wiki/teams" },
          { label: team.name },
        ]}
      />
      <PageHeader
        eyebrow="Team record"
        title={team.name}
        description={`${team.competitiveState}. The current record is resolved from active roster and staff tenures at the Kairos narrative date.`}
        badges={
          <>
            <CanonBadge />
            <GameBadge game={team.gameName} />
            <StatusBadge status={team.status} />
          </>
        }
        compact
      />
      <div className="entityLayout">
        <div className="entityBody">
          {hasKairosDbProfile("team", team.id) ? (
            <p className="muted">
              <a href={kairosDbTeamUrl(team.slug)}>
                Competitive profile on KairosDB
              </a>
            </p>
          ) : null}

          <section className="contentSection" id="overview">
            <div className="sectionHeader">
              <div>
                <span className="sectionKicker">Overview</span>
                <h2>Current competitive state</h2>
              </div>
            </div>
            <p className="lede">
              The team is active, training in Los Angeles, and has not played
              an official match.
            </p>
          </section>

          <section className="contentSection" id="current-roster">
            <h2>Current roster</h2>
            <TeamRosterTable roster={team.roster} />
          </section>

          <section className="contentSection" id="coaching-staff">
            <h2>Coaching staff</h2>
            <StaffTable staff={team.staff} />
          </section>

          <section className="contentSection" id="leadership">
            <h2>Leadership</h2>
            <div className="featureCard">
              <span className="sectionKicker">Confirmed captain</span>
              <h3>{captain?.nickname ?? "Unknown"}</h3>
              <p className="muted">
                {captain?.realName ?? "Unknown"} is the only confirmed captain
                of the League main roster.
              </p>
            </div>
          </section>

          <section className="contentSection" id="mentorship">
            <h2>Mentorship</h2>
            <div className="tableWrap">
              <table className="dataTable">
                <thead>
                  <tr>
                    <th scope="col">Player</th>
                    <th scope="col">Role</th>
                    <th scope="col">Mentor</th>
                    <th scope="col">Reference type</th>
                  </tr>
                </thead>
                <tbody>
                  {team.mentors.map((mentor) => (
                    <tr key={mentor.id}>
                      <td data-label="Player">{mentor.playerName}</td>
                      <td data-label="Role">{mentor.role}</td>
                      <td data-label="Mentor">
                        {mentor.nickname ?? mentor.name}
                      </td>
                      <td data-label="Reference type">
                        {mentor.realWorldFigure
                          ? "Real-world figure in a fictional role"
                          : "Fictional character"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="contentSection" id="team-history">
            <h2>Team history</h2>
            <p>
              The structured team record contains no official competitive
              history, achievements, or results. Narrative development is
              preserved through episode references instead.
            </p>
          </section>

          <section className="contentSection" id="roster-history">
            <h2>Roster history</h2>
            <TenureTimeline entries={team.roster} />
          </section>

          <section className="contentSection" id="upcoming-milestones">
            <h2>Upcoming milestones</h2>
            <div className="timeline">
              <div className="timelineItem">
                <span className="timelineDate">December 2026</span>
                <div>
                  <strong>Phase Two training</strong>
                  <p className="muted">
                    Regular external scrims are planned. No opponent is named.
                  </p>
                </div>
              </div>
              <div className="timelineItem">
                <span className="timelineDate">
                  {team.officialDebutPeriod}
                </span>
                <div>
                  <strong>Planned competitive milestone</strong>
                  <p className="muted">
                    The exact date and confirmed competition participation
                    remain TBD.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="contentSection" id="match-history">
            <h2>Match history</h2>
            <EmptyState
              title="No official matches recorded"
              description="The absence of matches is not presented as a 0-0 record. Private practice and future official competition remain separate data contexts."
            />
          </section>

          <section className="contentSection" id="statistics">
            <h2>Statistics</h2>
            <EmptyState
              title="No official statistics"
              description="No official match has occurred, so Kairospedia publishes no win rate, record, player statistic, or projected performance."
            />
          </section>

          <section className="contentSection" id="related-episodes">
            <h2>Related episodes</h2>
            <EpisodeReferenceList episodes={team.relatedEpisodes} />
          </section>

          <section className="contentSection" id="sources">
            <h2>Sources</h2>
            <SourceList sources={team.sources} />
          </section>
        </div>

        <EntityInfobox
          title={team.shortName}
          monogram="K"
          rows={[
            { label: "Stable ID", value: team.id },
            { label: "Organization", value: organization?.name ?? "Unknown" },
            { label: "Game", value: team.gameName },
            { label: "Level", value: team.rosterLevel },
            { label: "State", value: team.competitiveState },
            { label: "Intention", value: team.intendedCompetition },
            { label: "Captain", value: captain?.nickname ?? "Unknown" },
            {
              label: "Training",
              value: `${location.city}, ${location.region}, ${location.country}`,
            },
            { label: "Narrative period", value: team.currentStoryPeriod },
          ]}
        />
      </div>
    </>
  );
}
