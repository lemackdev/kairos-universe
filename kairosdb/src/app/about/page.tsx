import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About KairosDB" subtitle="Competitive careers and results from the Kairos Universe" />
      <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "72ch" }}>
        <p>
          KairosDB is the competitive career and results database for the
          Kairos Universe. It is a separate product from{" "}
          <a href="https://kairospedia.example" style={{ color: "var(--accent)" }}>
            Kairospedia
          </a>
          , which remains the narrative canon encyclopedia. KairosDB tracks
          players, teams, organizations, rosters, staff, transfers,
          competitions, matches, results, statistics, and career histories.
        </p>
        <p>
          KairosDB combines two kinds of data:
        </p>
        <ul>
          <li>
            <strong>Kairos Universe original</strong> profiles — the fictional
            players and teams of the Kairos story, read directly from the
            canonical repository. These are never imported from any external
            source.
          </li>
          <li>
            <strong>Real-world reference snapshot</strong> profiles — a frozen,
            structured import of the League of Legends competitive ecosystem
            from Leaguepedia, captured August 3, 2026 and frozen through the
            2027 midseason review window. See{" "}
            <a href="/snapshot" style={{ color: "var(--accent)" }}>
              /snapshot
            </a>{" "}
            for details.
          </li>
        </ul>
        <p>
          Real-world roster changes after August 3, 2026 do not automatically
          alter KairosDB or the Kairos Universe. Any later change — adopting a
          real-world transfer, rejecting one, or diverging into a fictional
          transfer — requires explicit review and approval. See{" "}
          <a href="/sources" style={{ color: "var(--accent)" }}>
            /sources
          </a>{" "}
          for attribution and licensing.
        </p>
      </div>
    </>
  );
}
