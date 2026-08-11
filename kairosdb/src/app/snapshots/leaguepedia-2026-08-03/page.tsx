import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "leaguepedia-2026-08-03" };

export default function SnapshotDetailPage() {
  const { external } = getCatalog();

  return (
    <>
      <PageHeader title="leaguepedia-2026-08-03" subtitle="2026 Competitive World Snapshot" />
      <div className="container" style={{ padding: "1.5rem" }}>
        <ul>
          <li>
            <Link href="/snapshots/leaguepedia-2026-08-03/teams" style={{ color: "var(--accent)" }}>
              Teams ({external.teams.length})
            </Link>
          </li>
          <li>
            <Link href="/snapshots/leaguepedia-2026-08-03/players" style={{ color: "var(--accent)" }}>
              Players ({external.players.length})
            </Link>
          </li>
          <li>
            <Link href="/regions" style={{ color: "var(--accent)" }}>
              Browse by region
            </Link>
          </li>
          <li>
            <Link href="/snapshot" style={{ color: "var(--accent)" }}>
              Full snapshot policy and status
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
