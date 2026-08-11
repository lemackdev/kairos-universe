import { notFound } from "next/navigation";
import Link from "next/link";

import { OriginBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  const { external } = getCatalog();
  return external.organizations.map((o) => ({ slug: o.slug }));
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { external } = getCatalog();
  const org = external.organizations.find((o) => o.slug === slug);
  if (!org) notFound();

  const teams = external.teams.filter((t) => org.teamIds.includes(t.id));

  return (
    <>
      <PageHeader
        title={org.name}
        subtitle={org.region ?? undefined}
        meta={<OriginBadge origin="external-snapshot" />}
      />
      <div className="container" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem" }}>Teams</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Region</th>
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
                  <td>{t.region ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--text-faint)", fontSize: "12.5px", marginTop: "1.5rem" }}>
          Source: Leaguepedia page &ldquo;{org.sourceOrganizationPage}&rdquo;.
        </p>
      </div>
    </>
  );
}
