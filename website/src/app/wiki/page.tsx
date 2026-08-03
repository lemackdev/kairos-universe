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
        title="A living record of a world before its first official match."
        description="The esports encyclopedia of the Kairos Universe. This first publication opens one carefully bounded window: the Kairos League of Legends main team."
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
            <h2 id="release-scope">One team, fully sourced</h2>
          </div>
          <p>
            Canon remains broader than this website. The publication manifest
            prevents unfinished divisions and external entities from leaking
            into pages, routes, or search.
          </p>
        </div>
        <div className="metricGrid">
          <div className="metricCard">
            <div className="metricValue">{catalog.organizations.length}</div>
            <div className="metricLabel">Published organization</div>
          </div>
          <div className="metricCard">
            <div className="metricValue">{catalog.teams.length}</div>
            <div className="metricLabel">Published team</div>
          </div>
          <div className="metricCard">
            <div className="metricValue">{catalog.players.length}</div>
            <div className="metricLabel">Active players</div>
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
