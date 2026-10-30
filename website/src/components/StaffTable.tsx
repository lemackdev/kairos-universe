import type { StaffEntryView } from "@/types/catalog";

import { EntityLink } from "./EntityLink";

export function StaffTable({ staff }: { staff: StaffEntryView[] }) {
  return (
    <div className="tableWrap">
      <table className="dataTable">
        <caption className="srOnly">Coaching and support staff</caption>
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Title</th>
            <th scope="col">Scope</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((entry) => (
            <tr key={entry.tenureId}>
              <td data-label="Person">
                <EntityLink
                  href={`/wiki/staff/${entry.slug}`}
                  name={entry.nickname ?? entry.realName}
                  detail={entry.nickname ? entry.realName : undefined}
                />
              </td>
              <td data-label="Title">{entry.title}</td>
              <td data-label="Scope">
                {entry.teamScope ? "Team" : "Division"}
              </td>
              <td data-label="Status">{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
