import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Sources & Attribution" };

export default function SourcesPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="Sources & attribution" subtitle="Where KairosDB's real-world reference data comes from" />
      <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "72ch" }}>
        <p>
          Structured competitive data — team rosters, player identity fields,
          staff roles, and roster tenure dates — is adapted from{" "}
          <a
            href="https://lol.fandom.com/"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--accent)" }}
          >
            Leaguepedia / League of Legends Esports Wiki
          </a>{" "}
          via its MediaWiki and Cargo APIs. Leaguepedia page content is
          generally published under{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noreferrer noopener"
            style={{ color: "var(--accent)" }}
          >
            CC BY-SA 3.0
          </a>{" "}
          unless otherwise noted on the source page.
        </p>
        <p>
          Every imported record preserves its source page title, page ID,
          revision ID, revision timestamp, retrieval timestamp, and the
          snapshot it belongs to. Long-form biography text, news articles, and
          images (player photographs, team logos, flags, tournament art) are
          never imported.
        </p>
        <p>
          Kairos Universe fictional events, teams, and players are not
          real-world people, organizations, or events. No official Kairos
          match has occurred.
        </p>
        <p>
          Full policy detail:{" "}
          <code>docs/kairosdb/DATA_SOURCES_AND_ATTRIBUTION.md</code> in the
          repository.
        </p>
        {external.snapshotExists ? (
          <p style={{ color: "var(--text-muted)" }}>
            Current frozen snapshot: <code>{external.descriptor?.snapshotId}</code>,
            captured {external.descriptor?.capturedDate}.
          </p>
        ) : null}
      </div>
    </>
  );
}
