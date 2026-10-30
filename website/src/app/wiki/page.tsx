import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge, StatusBadge } from "@/components/Badges";
import { EntityCard } from "@/components/EntityCard";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export default function WikiHomePage() {
  const catalog = getCatalog();
  const team = catalog.teams[0];

  return (
    <>
      <Breadcrumbs items={[{ label: "Kairospedia" }]} />
      <PageHeader
        eyebrow="Release 01 / Canon indexed"
        title="The people, teams, and history of a competitive world."
        description="The esports encyclopedia of the Kairos Universe. Explore Kairos League canon and a separately sourced pre-Worlds 2026 reference scene."
        badges={
          <>
            <CanonBadge />
            <StatusBadge status="limited-publication" />
          </>
        }
      />

      <section className="contentSection" aria-labelledby="release-scope">
        <div className="sectionHeader">
          <div>
            <span className="sectionKicker">Current release</span>
            <h2 id="release-scope">Kairos canon publication</h2>
          </div>
          <p>
            Canon remains broader than this website. Unfinished Kairos divisions
            remain hidden. External reference research is published separately
            and does not change the narrative.
          </p>
        </div>
        <div className="metricGrid">
          <div className="metricCard">
            <div className="metricValue">{catalog.organizations.length}</div>
            <div className="metricLabel">Canon organization</div>
          </div>
          <div className="metricCard">
            <div className="metricValue">{catalog.teams.length}</div>
            <div className="metricLabel">Canon team</div>
          </div>
          <div className="metricCard">
            <div className="metricValue">{catalog.players.length}</div>
            <div className="metricLabel">Active Kairos players</div>
          </div>
        </div>
      </section>

      <section className="contentSection" aria-labelledby="entry-points">
        <div className="sectionHeader">
          <div>
            <span className="sectionKicker">Entry points</span>
            <h2 id="entry-points">Browse the active record</h2>
          </div>
        </div>
        <div className="entityGrid">
          {catalog.externalScene && <EntityCard href="/wiki/world" kicker="Real-world references"
            title="Before Worlds 2026" description="LCK, LPL, LEC, CBLOL, LCS, LCP and NACL. Source-linked tournament rosters, review pending."
            meta={`${catalog.externalScene.teams.length} teams / ${catalog.externalScene.players.length} players`} />}
          <EntityCard
            href="/wiki/games/league-of-legends"
            kicker="Game"
            title="League of Legends"
            description="Roles, published people, and the latest relevant canon updates."
            meta="1 active team"
          />
          <EntityCard
            href="/wiki/organizations/kairos-esports"
            kicker="Organization"
            title="Kairos Esports"
            description="The organization view exposes only the division enabled for this release."
            meta="Fictional origin"
          />
          <EntityCard
            href={`/wiki/teams/${team?.slug ?? "kairos-lol-main"}`}
            kicker="Team"
            title={team?.name ?? "Kairos League of Legends"}
            description="Current roster, staff, leadership, mentorship, milestones, episodes, and sources."
            meta="Training and pre-debut"
          />
        </div>
      </section>

      <section className="contentSection" aria-labelledby="source-principle">
        <div className="sectionHeader">
          <div>
            <span className="sectionKicker">Source principle</span>
            <h2 id="source-principle">Canon first, interface second</h2>
          </div>
        </div>
        <div className="featureGrid">
          <div className="featureCard">
            <h3>Repository data</h3>
            <p className="muted">
              Names, roles, dates, roster state, and relationships are loaded
              from canonical JSON records.
            </p>
          </div>
          <div className="featureCard">
            <h3>Publication control</h3>
            <p className="muted">
              A hidden canonical entity remains canon. It simply has no public
              Kairospedia route yet.
            </p>
          </div>
          <div className="featureCard">
            <h3>Unknown stays unknown</h3>
            <p className="muted">
              Missing facts display as Unknown, TBD, or do not render. The
              interface never fills gaps with guesses.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
