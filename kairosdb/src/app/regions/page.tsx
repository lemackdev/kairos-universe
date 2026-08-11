import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Regions" };

export default function RegionsPage() {
  const { external } = getCatalog();

  const byRegion = new Map<string, number>();
  for (const team of external.teams) {
    const region = team.region ?? "Unknown";
    byRegion.set(region, (byRegion.get(region) ?? 0) + 1);
  }
  const regions = Array.from(byRegion.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title="Regions" subtitle={`${regions.length} regions represented`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        {regions.length === 0 ? (
          <EmptyState title="No regional data yet" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Teams</th>
                </tr>
              </thead>
              <tbody>
                {regions.map(([region, count]) => (
                  <tr key={region}>
                    <td>
                      <Link
                        href={`/snapshots/leaguepedia-2026-08-03/regions/${encodeURIComponent(region)}`}
                        style={{ color: "var(--accent)" }}
                      >
                        {region}
                      </Link>
                    </td>
                    <td className="mono">{count}</td>
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
