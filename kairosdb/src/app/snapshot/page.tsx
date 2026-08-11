import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { getCatalog } from "@/lib/canon/server";

export const metadata = { title: "Snapshot" };

export default function SnapshotPage() {
  const { external } = getCatalog();
  const d = external.descriptor;

  return (
    <>
      <PageHeader
        title="2026 Competitive World Snapshot"
        subtitle="leaguepedia-2026-08-03"
      />
      <div className="container" style={{ padding: "2rem 1.5rem", maxWidth: "72ch" }}>
        {!d ? (
          <EmptyState
            title="Snapshot not yet populated"
            detail="The live Leaguepedia import has not completed successfully in this environment yet. This page will show the frozen snapshot's policy, coverage, and record counts once it has."
          />
        ) : (
          <>
            <table style={{ marginBottom: "1.5rem" }}>
              <tbody>
                <tr>
                  <th>Snapshot ID</th>
                  <td className="mono">{d.snapshotId}</td>
                </tr>
                <tr>
                  <th>Source</th>
                  <td>{d.source}</td>
                </tr>
                <tr>
                  <th>Captured date</th>
                  <td>{d.capturedDate}</td>
                </tr>
                <tr>
                  <th>Cutoff (local / UTC)</th>
                  <td className="mono">
                    {d.cutoffLocal} / {d.cutoffUtc}
                  </td>
                </tr>
                <tr>
                  <th>Kairos Universe effective period</th>
                  <td>{d.effectiveUniversePeriod}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>
                    <span className={d.status === "frozen" ? "badge badge-kairos" : "badge badge-warn"}>
                      {d.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Automatic updates</th>
                  <td>{d.automaticUpdatesEnabled ? "enabled" : "disabled"}</td>
                </tr>
                <tr>
                  <th>Next review period</th>
                  <td>{d.nextReviewPeriod}</td>
                </tr>
                <tr>
                  <th>Changes require explicit approval</th>
                  <td>{d.changesRequireExplicitApproval ? "yes" : "no"}</td>
                </tr>
              </tbody>
            </table>

            <h2 style={{ fontSize: "1.05rem" }}>Record counts</h2>
            <ul>
              {Object.entries(d.recordCounts).map(([kind, count]) => (
                <li key={kind}>
                  {kind}: <span className="mono">{count}</span>
                </li>
              ))}
            </ul>

            <p style={{ color: "var(--text-muted)" }}>
              {d.needsReview} record(s) currently need review before
              publication is considered fully approved.
            </p>

            {d.notes.length > 0 ? (
              <div className="empty-state">
                {d.notes.map((n) => (
                  <p key={n} style={{ margin: 0 }}>
                    {n}
                  </p>
                ))}
              </div>
            ) : null}
          </>
        )}

        <p style={{ marginTop: "2rem", color: "var(--text-muted)" }}>
          Real-world roster changes after August 3, 2026 do not automatically
          alter this snapshot or the Kairos Universe. The next scheduled
          review window is 2027 midseason.
        </p>
      </div>
    </>
  );
}
