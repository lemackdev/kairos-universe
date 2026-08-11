import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Snapshot players" };

export default function SnapshotPlayersPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="Snapshot players" subtitle="leaguepedia-2026-08-03" />
      <div className="container" style={{ padding: "1.5rem" }}>
        {external.players.length === 0 ? (
          <EmptyState title="No players in this snapshot yet" />
        ) : (
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
                {external.players.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/players/${p.slug}`} style={{ color: "var(--accent)" }}>
                        {p.nickname}
                      </Link>
                    </td>
                    <td className="mono">{p.primaryRole ?? "unknown"}</td>
                    <td>
                      {external.teams.find((t) => t.id === p.currentTeamId)?.shortName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
