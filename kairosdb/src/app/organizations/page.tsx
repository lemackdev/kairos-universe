import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="Organizations" subtitle={`${external.organizations.length} organizations`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        {external.organizations.length === 0 ? (
          <EmptyState
            title="No organizations yet"
            detail="Organizations are derived from the frozen Leaguepedia snapshot's team OrganizationPage field. See /snapshot for status."
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Region</th>
                  <th>Teams</th>
                </tr>
              </thead>
              <tbody>
                {external.organizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <Link href={`/organizations/${org.slug}`} style={{ color: "var(--accent)" }}>
                        {org.name}
                      </Link>
                    </td>
                    <td>{org.region ?? "—"}</td>
                    <td>{org.teamIds.length}</td>
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
