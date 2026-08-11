import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { OriginBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  const { kairos, external } = getCatalog();

  return (
    <>
      <PageHeader title="Teams" subtitle={`${external.teams.length + 1} teams`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        {external.teams.length === 0 ? (
          <EmptyState
            title="Only the Kairos team is available"
            detail="External teams will appear once the frozen Leaguepedia snapshot is populated. See /snapshot for status."
          />
        ) : null}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Region</th>
                <th>Status</th>
                <th>Origin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link href={`/teams/${kairos.team.slug}`} style={{ color: "var(--accent)" }}>
                    {kairos.team.name}
                  </Link>
                </td>
                <td>—</td>
                <td>{kairos.team.status}</td>
                <td>
                  <OriginBadge origin="kairos-original" />
                </td>
              </tr>
              {external.teams.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/teams/${t.slug}`} style={{ color: "var(--accent)" }}>
                      {t.name}
                    </Link>
                  </td>
                  <td>{t.region ?? "—"}</td>
                  <td>{t.status}</td>
                  <td>
                    <OriginBadge origin="external-snapshot" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
