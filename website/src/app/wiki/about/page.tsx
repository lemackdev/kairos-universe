import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "About" };

export default function AboutPage() {
  const { metadata } = getCatalog();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "About" },
        ]}
      />
      <PageHeader
        eyebrow="Archive policy"
        title="An encyclopedia layer, not a second canon."
        description="Kairospedia converts canonical repository records into browsable pages. It never writes changes back into those records."
        compact
      />
      <section className="contentSection">
        <h2>Three clocks</h2>
        <div className="featureGrid">
          <div className="featureCard">
            <h3>Real current date</h3>
            <p className="muted">
              The viewer&apos;s calendar is not used to calculate canonical
              ages or roster state.
            </p>
          </div>
          <div className="featureCard">
            <h3>Narrative date</h3>
            <p className="muted">
              Current profiles resolve against {metadata.currentNarrativeDate},
              the machine-readable Kairos story date.
            </p>
          </div>
          <div className="featureCard">
            <h3>Historical event date</h3>
            <p className="muted">
              Future match and roster history pages will resolve age and
              membership against each event&apos;s own date.
            </p>
          </div>
        </div>
      </section>
      <section className="contentSection">
        <h2>Fiction and real-world references</h2>
        <p className="lede">
          Real esports figures and organizations may be referenced in the
          fictional continuity. Their involvement in Kairos events is
          fictional and must never be presented as a real-world result.
        </p>
      </section>
      <section className="contentSection">
        <h2>Current boundary</h2>
        <p>
          The canonical collection publishes Kairos Esports, its League of Legends
          and Counter-Strike main teams, their ten players, associated published staff,
          and confirmed mentorship relationships. Academy teams remain hidden.
          Player portraits are AI-generated visualizations, not documentary photographs.
        </p>
        <p>A separate <Link href="/wiki/world">pre-Worlds 2026 reference collection</Link> covers LCK, LPL, LEC, CBLOL, LCS, LCP and NACL. These event-roster observations are researched but still need final source review. They do not establish fictional appearances, current contracts or match results.</p>
      </section>
    </>
  );
}
