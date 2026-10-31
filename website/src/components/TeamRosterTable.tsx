"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { RosterEntryView } from "@/types/catalog";
import { NationalityFlags } from "./NationalityFlags";
import { RoleIcon } from "./RoleIcon";
import { formatDate } from "@/lib/formatting/date";

type SortColumn = "nationality" | "player" | "name" | "role" | "contractEndDate" | "joinedDate";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortColumn; label: string }> = [
  { key: "nationality", label: "Region" },
  { key: "player", label: "Player" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "contractEndDate", label: "Contract Ends" },
  { key: "joinedDate", label: "Joined" },
];

const roleOrder = ["top", "jungle", "mid", "adc", "bot", "support"];

function roleRank(role: string): number {
  const index = roleOrder.indexOf(role.trim().toLowerCase());
  return index === -1 ? roleOrder.length : index;
}

function sortValue(entry: RosterEntryView, column: SortColumn): string {
  switch (column) {
    case "nationality": return entry.nationality ?? "";
    case "player": return entry.nickname;
    case "name": return entry.realName;
    case "role": return entry.role;
    case "contractEndDate": return entry.contractEndDate ?? "";
    case "joinedDate": return entry.joinedDate ?? "";
  }
}

export function TeamRosterTable({ roster, caption = "Current active roster" }: { roster: RosterEntryView[]; caption?: string }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("role");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    if (sortColumn === "role") return [...roster].sort((a, b) => (roleRank(a.role) - roleRank(b.role)) * factor);
    return [...roster].sort((a, b) => sortValue(a, sortColumn).localeCompare(sortValue(b, sortColumn)) * factor);
  }, [roster, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  if (!roster.length) return <p>No active players recorded.</p>;

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
              <td data-label="Region">
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <NationalityFlags nationality={entry.nationality} nationalities={entry.nationalities} compact />
                  NA
                </span>
              </td>
              <td data-label="Player">
                <Link href={`/wiki/players/${entry.slug}`}>{entry.nickname}</Link>
                {entry.isCaptain && <span className="badge badgeCanon" style={{ marginLeft: "0.4rem" }}>Captain</span>}
              </td>
              <td data-label="Name">{entry.realName}</td>
              <td data-label="Role"><span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}><RoleIcon role={entry.role} />{entry.role}</span></td>
              <td data-label="Contract Ends">{formatDate(entry.contractEndDate)}</td>
              <td data-label="Joined">{formatDate(entry.joinedDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
