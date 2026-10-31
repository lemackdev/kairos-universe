"use client";

import { useMemo, useState } from "react";
import type { StaffView } from "@/types/catalog";
import { EntityLink } from "./EntityLink";
import { NationalityFlags } from "./NationalityFlags";

type SortColumn = "nationality" | "id" | "name" | "role" | "division";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortColumn; label: string }> = [
  { key: "nationality", label: "Nat." },
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "division", label: "Division" },
];

function sortValue(entry: StaffView, column: SortColumn): string {
  switch (column) {
    case "nationality": return entry.nationality ?? "";
    case "id": return entry.nickname ?? entry.realName;
    case "name": return entry.realName;
    case "role": return entry.role;
    case "division": return entry.division;
  }
}

export function ManagementTable({ staff, caption = "Kairos management" }: { staff: StaffView[]; caption?: string }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("division");
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

  if (!staff.length) return <p>No management staff recorded.</p>;

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
            <tr key={entry.id}>
              <td data-label="Nat."><NationalityFlags nationality={entry.nationality} compact /></td>
              <td data-label="ID">
                <EntityLink href={`/wiki/staff/${entry.slug}`} name={entry.nickname ?? entry.realName} />
              </td>
              <td data-label="Name">{entry.realName}</td>
              <td data-label="Role">{entry.role}</td>
              <td data-label="Division">{entry.division}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
