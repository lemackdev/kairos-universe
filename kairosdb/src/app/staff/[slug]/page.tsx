import { notFound } from "next/navigation";
import Link from "next/link";

import { OriginBadge, ReviewBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export function generateStaticParams() {
  const { external } = getCatalog();
  return external.staff.map((s) => ({ slug: s.slug }));
}

export default async function StaffMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { external } = getCatalog();
  const staff = external.staff.find((s) => s.slug === slug);
  if (!staff) notFound();

  const team = external.teams.find((t) => t.id === staff.currentTeamId);
  const tenures = external.staffTenures.filter((st) => st.staffId === staff.id);
  const linkedPlayer = staff.linkedPlayerId
    ? external.players.find((p) => p.id === staff.linkedPlayerId)
    : null;

  return (
    <>
      <PageHeader
        title={staff.nickname}
        subtitle={staff.fullName ?? staff.legalName ?? undefined}
        meta={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <OriginBadge origin="external-snapshot" />
            <ReviewBadge status={staff.reviewStatus} />
          </div>
        }
      />
      <div className="container" style={{ padding: "1.5rem", maxWidth: "72ch" }}>
        <dl className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem" }}>
          <dt style={{ color: "var(--text-muted)" }}>Country</dt>
          <dd style={{ margin: 0 }}>{staff.countryOfBirth ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Residency</dt>
          <dd style={{ margin: 0 }}>{staff.residency ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Current team</dt>
          <dd style={{ margin: 0 }}>
            {team ? (
              <Link href={`/teams/${team.slug}`} style={{ color: "var(--accent)" }}>
                {team.name}
              </Link>
            ) : (
              "Unknown"
            )}
          </dd>
          {linkedPlayer ? (
            <>
              <dt style={{ color: "var(--text-muted)" }}>Also plays as</dt>
              <dd style={{ margin: 0 }}>
                <Link href={`/players/${linkedPlayer.slug}`} style={{ color: "var(--accent)" }}>
                  {linkedPlayer.nickname}
                </Link>
              </dd>
            </>
          ) : null}
        </dl>

        <h2 style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>Roles</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {tenures.map((t) => {
                const tTeam = external.teams.find((tm) => tm.id === t.teamId);
                return (
                  <tr key={t.id}>
                    <td>{tTeam?.name ?? "Unknown"}</td>
                    <td>{t.role}</td>
                    <td>{t.joinedDate ?? "Unknown"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p style={{ color: "var(--text-faint)", fontSize: "12.5px", marginTop: "1.5rem" }}>
          Source: Leaguepedia page &ldquo;{staff.leaguepediaPage}&rdquo;.
        </p>
      </div>
    </>
  );
}
