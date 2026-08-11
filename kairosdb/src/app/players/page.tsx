import Link from "next/link";

import { EmptyState } from "@/components/EmptyState";
import { OriginBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Players" };

export default function PlayersPage() {
  const { kairos, external } = getCatalog();

  const kairosRows = kairos.players.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: `${p.realName} "${p.nickname}"`,
    role: p.role,
    team: kairos.team.shortName,
    origin: "kairos-original" as const,
  }));
  const externalRows = external.players.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.nickname,
    role: p.primaryRole ?? "unknown",
    team: external.teams.find((t) => t.id === p.currentTeamId)?.shortName ?? "—",
    origin: "external-snapshot" as const,
  }));

  const rows = [...kairosRows, ...externalRows];

  return (
    <>
      <PageHeader title="Players" subtitle={`${rows.length} profiles`} />
      <div className="container" style={{ padding: "1.5rem" }}>
        {rows.length === 0 ? (
          <EmptyState title="No players yet" />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Origin</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/players/${r.slug}`} style={{ color: "var(--accent)" }}>
                        {r.name}
                      </Link>
                    </td>
                    <td className="mono">{r.role}</td>
                    <td>{r.team}</td>
                    <td>
                      <OriginBadge origin={r.origin} />
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
