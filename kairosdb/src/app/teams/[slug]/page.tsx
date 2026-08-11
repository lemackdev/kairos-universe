import { notFound } from "next/navigation";
import Link from "next/link";

import { OriginBadge, ReviewBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";
import { kairospediaTeamUrl } from "@/lib/links";

export function generateStaticParams() {
  const { kairos, external } = getCatalog();
  return [{ slug: kairos.team.slug }, ...external.teams.map((t) => ({ slug: t.slug }))];
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { kairos, external } = getCatalog();

  if (slug === kairos.team.slug) {
    return (
      <>
        <PageHeader
          title={kairos.team.name}
          subtitle={kairos.team.shortName}
          meta={<OriginBadge origin="kairos-original" />}
        />
        <div className="container" style={{ padding: "1.5rem" }}>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Captain</th>
                </tr>
              </thead>
              <tbody>
                {kairos.players.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/players/${p.slug}`} style={{ color: "var(--accent)" }}>
                        {p.realName} &ldquo;{p.nickname}&rdquo;
                      </Link>
                    </td>
                    <td className="mono">{p.role}</td>
                    <td>{p.isCaptain ? "Yes" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: "1.5rem" }}>
            <a href={kairospediaTeamUrl(kairos.team.slug)} style={{ color: "var(--accent)" }}>
              Read canonical narrative profile on Kairospedia
            </a>
          </p>
        </div>
      </>
    );
  }

  const team = external.teams.find((t) => t.slug === slug);
  if (!team) notFound();

  const org = external.organizations.find((o) => o.id === team.organizationId);
  const roster = external.rosterTenures.filter((rt) => rt.teamId === team.id);
  const staffTenures = external.staffTenures.filter((st) => st.teamId === team.id);
  const playersById = new Map(external.players.map((p) => [p.id, p]));
  const staffById = new Map(external.staff.map((s) => [s.id, s]));

  const starters = roster.filter((r) => r.isStarter);
  const subs = roster.filter((r) => r.isSubstitute);
  const trainees = roster.filter((r) => r.isTrainee);

  function rosterRow(rt: (typeof roster)[number]) {
    const player = playersById.get(rt.playerId);
    return (
      <tr key={rt.id}>
        <td>
          {player ? (
            <Link href={`/players/${player.slug}`} style={{ color: "var(--accent)" }}>
              {player.nickname}
            </Link>
          ) : (
            "Unknown"
          )}
        </td>
        <td className="mono">{rt.roles.join(", ") || "unknown"}</td>
        <td>{rt.joinedDate ?? "Unknown"}</td>
        <td>
          <ReviewBadge status={rt.reviewStatus} />
        </td>
      </tr>
    );
  }

  return (
    <>
      <PageHeader
        title={team.name}
        subtitle={[team.region, org?.name].filter(Boolean).join(" — ") || undefined}
        meta={
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <OriginBadge origin="external-snapshot" />
            <ReviewBadge status={team.reviewStatus} />
          </div>
        }
      />
      <div className="container" style={{ padding: "1.5rem" }}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          Roster snapshot: August 3, 2026 &middot; Kairos Universe status:
          Frozen through 2027 Midseason
        </div>

        <h2 style={{ fontSize: "1.05rem" }}>Starters</h2>
        <div className="table-scroll" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{starters.length > 0 ? starters.map(rosterRow) : (
              <tr>
                <td colSpan={4} style={{ color: "var(--text-muted)" }}>No starters recorded.</td>
              </tr>
            )}</tbody>
          </table>
        </div>

        {subs.length > 0 ? (
          <>
            <h2 style={{ fontSize: "1.05rem" }}>Substitutes</h2>
            <div className="table-scroll" style={{ marginBottom: "1.5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>{subs.map(rosterRow)}</tbody>
              </table>
            </div>
          </>
        ) : null}

        {trainees.length > 0 ? (
          <>
            <h2 style={{ fontSize: "1.05rem" }}>Trainees</h2>
            <div className="table-scroll" style={{ marginBottom: "1.5rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>{trainees.map(rosterRow)}</tbody>
              </table>
            </div>
          </>
        ) : null}

        <h2 style={{ fontSize: "1.05rem" }}>Coaching staff</h2>
        <div className="table-scroll" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {staffTenures.length > 0 ? (
                staffTenures.map((st) => {
                  const staff = staffById.get(st.staffId);
                  return (
                    <tr key={st.id}>
                      <td>
                        {staff ? (
                          <Link href={`/staff/${staff.slug}`} style={{ color: "var(--accent)" }}>
                            {staff.nickname}
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </td>
                      <td>{st.role}</td>
                      <td>{st.joinedDate ?? "Unknown"}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} style={{ color: "var(--text-muted)" }}>No coaching staff recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={{ color: "var(--text-faint)", fontSize: "12.5px" }}>
          Source: Leaguepedia page &ldquo;{team.leaguepediaOverviewPage}&rdquo;.
          Adapted under CC BY-SA 3.0. See{" "}
          <Link href="/sources" style={{ color: "var(--text-muted)" }}>
            /sources
          </Link>{" "}
          for full attribution.
        </p>
      </div>
    </>
  );
}
