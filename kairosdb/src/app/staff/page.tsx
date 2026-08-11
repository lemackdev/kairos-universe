import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { OriginBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Staff" };

export default function StaffPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="Staff" subtitle={`${external.staff.length} coaching staff`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        {external.staff.length === 0 ? (
          <EmptyState
            title="No staff yet"
            detail="Coaching staff will appear once the frozen Leaguepedia snapshot is populated."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Team</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {external.staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/staff/${s.slug}`} style={{ color: "var(--accent)" }}>
                        {s.nickname}
                      </Link>
                    </td>
                    <td>
                      {external.teams.find((t) => t.id === s.currentTeamId)?.shortName ?? "—"}
                    </td>
                    <td>
                      <OriginBadge origin="external-snapshot" />
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
