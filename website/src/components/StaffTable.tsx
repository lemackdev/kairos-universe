"use client";

import { useMemo, useState } from "react";
import type { StaffEntryView } from "@/types/catalog";
import { EntityLink } from "./EntityLink";
import { NationalityFlags } from "./NationalityFlags";

type SortColumn = "nationality" | "id" | "name" | "title";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortColumn; label: string }> = [
  { key: "nationality", label: "Nat." },
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "title", label: "Position" },
];

function sortValue(entry: StaffEntryView, column: SortColumn): string {
  switch (column) {
    case "nationality": return entry.nationality ?? "";
    case "id": return entry.nickname ?? entry.realName;
    case "name": return entry.realName;
    case "title": return entry.title;
  }
}

export function StaffTable({ staff, caption = "Coaching and support staff" }: { staff: StaffEntryView[]; caption?: string }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...staff].sort((a, b) => sortValue(a, sortColumn).localeCompare(sortValue(b, sortColumn)) * factor);
  }, [staff, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  if (!staff.length) return <p>No staff recorded.</p>;

  return (
    <div className="tableWrap">
      <table className="dataTable">
        <caption className="srOnly">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => <th scope="col" key={column.key}>
              <button type="button" onClick={() => toggleSort(column.key)}
                aria-sort={sortColumn === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                {column.label}{sortColumn === column.key && <span aria-hidden="true">{sortDirection === "asc" ? "▲" : "▼"}</span>}
              </button>
            </th>)}
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <tr key={entry.tenureId}>
              <td data-label="Nat."><NationalityFlags nationality={entry.nationality} compact /></td>
              <td data-label="ID">
                <EntityLink href={`/wiki/staff/${entry.slug}`} name={entry.nickname ?? entry.realName} />
              </td>
              <td data-label="Name">{entry.realName}</td>
              <td data-label="Position">{entry.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
