import { notFound } from "next/navigation";
import Link from "next/link";

import { OriginBadge, ReviewBadge } from "@/components/Badge";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";
import { kairospediaPlayerUrl } from "@/lib/links";

export function generateStaticParams() {
  const { kairos, external } = getCatalog();
  return [
    ...kairos.players.map((p) => ({ slug: p.slug })),
    ...external.players.map((p) => ({ slug: p.slug })),
  ];
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { kairos, external } = getCatalog();

  const kairosPlayer = kairos.players.find((p) => p.slug === slug);
  if (kairosPlayer) {
    return (
      <>
        <PageHeader
          title={`${kairosPlayer.realName} "${kairosPlayer.nickname}"`}
          subtitle={`${kairosPlayer.role} — ${kairos.team.name}`}
          meta={<OriginBadge origin="kairos-original" />}
        />
        <div className="container" style={{ padding: "1.5rem", maxWidth: "72ch" }}>
          <dl className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem" }}>
            <dt style={{ color: "var(--text-muted)" }}>Nationality</dt>
            <dd style={{ margin: 0 }}>{kairosPlayer.nationality}</dd>
            <dt style={{ color: "var(--text-muted)" }}>City</dt>
            <dd style={{ margin: 0 }}>{kairosPlayer.city}</dd>
            <dt style={{ color: "var(--text-muted)" }}>Date of birth</dt>
            <dd style={{ margin: 0 }}>{kairosPlayer.dateOfBirth}</dd>
            <dt style={{ color: "var(--text-muted)" }}>Roster level</dt>
            <dd style={{ margin: 0 }}>{kairosPlayer.rosterLevel}</dd>
            <dt style={{ color: "var(--text-muted)" }}>Status</dt>
            <dd style={{ margin: 0 }}>{kairosPlayer.status}</dd>
            <dt style={{ color: "var(--text-muted)" }}>Team</dt>
            <dd style={{ margin: 0 }}>
              <Link href={`/teams/${kairos.team.slug}`} style={{ color: "var(--accent)" }}>
                {kairos.team.name}
              </Link>
            </dd>
          </dl>
          <p style={{ marginTop: "1.5rem" }}>
            <a href={kairospediaPlayerUrl(kairosPlayer.slug)} style={{ color: "var(--accent)" }}>
              Read canonical narrative profile on Kairospedia
            </a>
          </p>
        </div>
      </>
    );
  }

  const player = external.players.find((p) => p.slug === slug);
  if (!player) notFound();

  const team = external.teams.find((t) => t.id === player.currentTeamId);
  const tenure = external.rosterTenures.find(
    (t) => t.playerId === player.id && t.isCurrentAtSnapshot,
  );

  return (
    <>
      <PageHeader
        title={player.nickname}
        subtitle={player.fullName ?? player.legalName ?? undefined}
        meta={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <OriginBadge origin="external-snapshot" />
            <ReviewBadge status={player.reviewStatus} />
          </div>
        }
      />
      <div className="container" style={{ padding: "1.5rem", maxWidth: "72ch" }}>
        <dl className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem" }}>
          <dt style={{ color: "var(--text-muted)" }}>Country of birth</dt>
          <dd style={{ margin: 0 }}>{player.countryOfBirth ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Nationality</dt>
          <dd style={{ margin: 0 }}>{player.nationalities.join(", ") || "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Residency</dt>
          <dd style={{ margin: 0 }}>{player.residency ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Date of birth</dt>
          <dd style={{ margin: 0 }}>{player.dateOfBirth ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Primary role</dt>
          <dd style={{ margin: 0 }} className="mono">{player.primaryRole ?? "unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Current team (frozen snapshot)</dt>
          <dd style={{ margin: 0 }}>
            {team ? (
              <Link href={`/teams/${team.slug}`} style={{ color: "var(--accent)" }}>
                {team.name}
              </Link>
            ) : (
              "Unknown"
            )}
          </dd>
          <dt style={{ color: "var(--text-muted)" }}>Roster status</dt>
          <dd style={{ margin: 0 }}>
            {tenure
              ? [
                  tenure.isStarter && "Starter",
                  tenure.isSubstitute && "Substitute",
                  tenure.isTrainee && "Trainee",
                ]
                  .filter(Boolean)
                  .join(", ") || "Active"
              : "Unknown"}
          </dd>
          <dt style={{ color: "var(--text-muted)" }}>Current tenure start</dt>
          <dd style={{ margin: 0 }}>{tenure?.joinedDate ?? "Unknown"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Aliases</dt>
          <dd style={{ margin: 0 }}>{player.aliases.join(", ") || "None recorded"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Source page</dt>
          <dd style={{ margin: 0 }} className="mono">{player.leaguepediaPage}</dd>
        </dl>

        <div className="empty-state" style={{ marginTop: "1.5rem" }}>
          <p style={{ margin: 0 }}>Career history import: not yet complete</p>
        </div>
        <div className="empty-state" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: 0 }}>Tournament results: not yet imported</p>
        </div>
        <div className="empty-state" style={{ marginTop: "0.75rem" }}>
          <p style={{ margin: 0 }}>Statistics: not yet imported</p>
        </div>
      </div>
    </>
  );
}
