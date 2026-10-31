import type { RosterEntryView, StaffEntryView } from "@/types/catalog";
import { formatDate } from "@/lib/formatting/date";

export function TenureTimeline({
  entries,
}: {
  entries: Array<RosterEntryView | StaffEntryView>;
}) {
  return (
    <div className="timeline">
      {entries.map((entry) => {
        if ("playerId" in entry) {
          return (
            <div className="timelineItem" key={entry.tenureId}>
              <span className="timelineDate">
                {entry.joinedDate ? formatDate(entry.joinedDate) : "Join date TBD"}
              </span>
              <div>
                <strong>{entry.realName}</strong>
                <p className="muted">
                  {entry.role}, {entry.rosterStatus}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="timelineItem" key={entry.tenureId}>
            <span className="timelineDate">Start date TBD</span>
            <div>
              <strong>{entry.realName}</strong>
              <p className="muted">{entry.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
