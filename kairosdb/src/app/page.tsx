import Link from "next/link";

import { StatTile } from "@/components/StatTile";
import { getCatalog } from "@/lib/canon/server";

export default function HomePage() {
  const catalog = getCatalog();
  const { counts, external } = catalog;

  return (
    <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
      <h1 className="mono" style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
        KairosDB
      </h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "60ch" }}>
        Competitive careers and results from the Kairos Universe.
      </p>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          margin: "1.5rem 0 2rem",
        }}
      >
        <StatTile label="Kairos players" value={counts.kairosPlayers ?? 0} href="/players" />
        <StatTile label="External teams" value={counts.externalTeams ?? 0} href="/teams" />
        <StatTile label="External players" value={counts.externalPlayers ?? 0} href="/players" />
        <StatTile label="External staff" value={counts.externalStaff ?? 0} href="/staff" />
        <StatTile
          label="Organizations"
          value={counts.externalOrganizations ?? 0}
          href="/organizations"
        />
      </div>

      {!external.snapshotExists ? (
        <div className="empty-state" style={{ marginBottom: "2rem" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
            No external snapshot populated yet
          </p>
          <p style={{ margin: "0.4rem 0 0", fontSize: "13.5px" }}>
            The frozen Leaguepedia snapshot ({external.descriptor?.snapshotId ??
              "leaguepedia-2026-08-03"}) has not been imported into this
            environment yet. Kairos Universe original profiles are still
            fully available below. See{" "}
            <Link href="/snapshot" style={{ color: "var(--accent)" }}>
              /snapshot
            </Link>{" "}
            for status.
          </p>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <strong>Roster snapshot:</strong> August 3, 2026 &middot;{" "}
          <strong>Kairos Universe status:</strong> Frozen through 2027
          Midseason &middot;{" "}
          <Link href="/snapshot" style={{ color: "var(--accent)" }}>
            View snapshot details
          </Link>
        </div>
      )}

      <section>
        <h2 style={{ fontSize: "1.1rem" }}>Kairos Universe original</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {catalog.kairos.players.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/players/${p.slug}`} style={{ color: "var(--accent)" }}>
                      {p.realName} &ldquo;{p.nickname}&rdquo;
                    </Link>
                  </td>
                  <td>{p.role}</td>
                  <td>
                    <Link href={`/teams/${catalog.kairos.team.slug}`}>
                      {catalog.kairos.team.shortName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
