"use client";

import { useMemo, useState } from "react";
import { ArticleLink } from "./articles/WikiArticle";
import type { RosterEntryView } from "@/types/catalog";
import { formatDate } from "@/lib/formatting/date";

type SortColumn = "team" | "start" | "end" | "duration";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortColumn; label: string }> = [
  { key: "team", label: "Team" },
  { key: "start", label: "Start" },
  { key: "end", label: "End" },
  { key: "duration", label: "⏱" },
];

function durationDays(start: string | null, end: string | null): number {
  if (!start) return -1;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return "TBD";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  let days = endDate.getDate() - startDate.getDate();
  if (days < 0) { months -= 1; days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate(); }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (remMonths > 0 || (years > 0 && days > 0)) parts.push(`${remMonths}mo`);
  if (years === 0) parts.push(`${days}d`);
  return parts.join(" ") || "0d";
}

function sortValue(entry: RosterEntryView, column: SortColumn): number | string {
  switch (column) {
    case "team": return entry.teamName;
    case "start": return entry.joinedDate ?? "";
    case "end": return entry.leftDate ?? "9999-99-99";
    case "duration": return durationDays(entry.joinedDate, entry.leftDate);
  }
}

export function PlayerTeamHistoryTable({ history, caption = "Team history" }: { history: RosterEntryView[]; caption?: string }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("start");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...history].sort((a, b) => {
      const av = sortValue(a, sortColumn);
      const bv = sortValue(b, sortColumn);
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * factor;
    });
  }, [history, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  if (!history.length) return <p>No team history recorded.</p>;

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
              <td data-label="Team">
                <ArticleLink href={entry.teamSlug ? `/wiki/teams/${entry.teamSlug}` : null}>{entry.teamName}</ArticleLink>
              </td>
              <td data-label="Start">{formatDate(entry.joinedDate)}</td>
              <td data-label="End">{entry.leftDate ? formatDate(entry.leftDate) : (entry.rosterStatus === "active" ? "Present" : "TBD")}</td>
              <td data-label="Duration">{formatDuration(entry.joinedDate, entry.leftDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
