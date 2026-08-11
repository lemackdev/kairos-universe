import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  const { external } = getCatalog();
  const regions = new Set(external.teams.map((t) => t.region).filter((r): r is string => Boolean(r)));
  return Array.from(regions).map((region) => ({ region }));
}

export default async function SnapshotRegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const decoded = decodeURIComponent(region);
  const { external } = getCatalog();
  const teams = external.teams.filter((t) => t.region === decoded);
  if (teams.length === 0) notFound();

  return (
    <>
      <PageHeader title={decoded} subtitle={`${teams.length} teams`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/teams/${t.slug}`} style={{ color: "var(--accent)" }}>
                      {t.name}
                    </Link>
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
