"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RoleIcon } from "./RoleIcon";

export interface ExternalRosterRow {
  id: string;
  role: string;
  roleLabel: string;
  nickname: string;
  slug: string;
  designation: string;
}

type SortColumn = "role" | "player" | "designation";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortColumn; label: string }> = [
  { key: "role", label: "Role" },
  { key: "player", label: "Player" },
  { key: "designation", label: "Source listing" },
];

const roleOrder = ["top", "jungle", "mid", "bot", "support"];

function roleRank(role: string): number {
  const index = roleOrder.indexOf(role.trim().toLowerCase());
  return index === -1 ? roleOrder.length : index;
}

function sortValue(row: ExternalRosterRow, column: SortColumn): string {
  switch (column) {
    case "role": return row.role;
    case "player": return row.nickname;
    case "designation": return row.designation;
  }
}

export function ExternalRosterTable({ rows, caption = "Roster" }: { rows: ExternalRosterRow[]; caption?: string }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("role");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    if (sortColumn === "role") return [...rows].sort((a, b) => (roleRank(a.role) - roleRank(b.role)) * factor);
    return [...rows].sort((a, b) => sortValue(a, sortColumn).localeCompare(sortValue(b, sortColumn)) * factor);
  }, [rows, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  if (!rows.length) return <p>No roster imported.</p>;

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
          {sorted.map((row) => (
            <tr key={row.id}>
              <td data-label="Role"><span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><RoleIcon role={row.role} />{row.roleLabel}</span></td>
              <td data-label="Player"><Link href={`/wiki/players/${row.slug}`}>{row.nickname}</Link></td>
              <td data-label="Source listing">{row.designation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
