import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Snapshot teams" };

export default function SnapshotTeamsPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="Snapshot teams" subtitle="leaguepedia-2026-08-03" />
      <div className="container" style={{ padding: "1.5rem" }}>
        {external.teams.length === 0 ? (
          <EmptyState title="No teams in this snapshot yet" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {external.teams.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={`/teams/${t.slug}`} style={{ color: "var(--accent)" }}>
                        {t.name}
                      </Link>
                    </td>
                    <td>{t.region ?? "—"}</td>
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
