"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SceneTeam } from "@/types/external-scene";
import styles from "./WikiArticle.module.css";

const regionFlags: Record<string, { code: string; label: string }> = {
  China: { code: "cn", label: "China" },
  Korea: { code: "kr", label: "Korea" },
  Europe: { code: "eu", label: "Europe" },
  Brazil: { code: "br", label: "Brazil" },
  "North America": { code: "us", label: "North America" },
  Pacific: { code: "jp", label: "Pacific" },
};

type SortColumn = "name" | "league" | "region";
type SortDirection = "asc" | "desc";

export function RealWorldTeamsTable({ teams }: { teams: SceneTeam[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedTeams = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...teams].sort((a, b) => a[sortColumn].localeCompare(b[sortColumn]) * factor);
  }, [teams, sortColumn, sortDirection]);

  function toggleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const columns: Array<{ key: SortColumn; label: string }> = [
    { key: "name", label: "Team" },
    { key: "league", label: "League" },
    { key: "region", label: "Region" },
  ];

  return <div className={styles.tableWrap}>
    <table className={styles.table}>
      <caption>Real-world teams</caption>
      <thead><tr>{columns.map((column) => <th scope="col" key={column.key}>
        <button type="button" onClick={() => toggleSort(column.key)} aria-sort={sortColumn === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
          style={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          {column.label}{sortColumn === column.key && <span aria-hidden="true">{sortDirection === "asc" ? "▲" : "▼"}</span>}
        </button>
      </th>)}</tr></thead>
      <tbody>{sortedTeams.length ? sortedTeams.map((team) => {
        const flag = regionFlags[team.region];
        return <tr key={team.id}>
          <td data-label="Team"><Link href={`/wiki/teams/${team.slug}`}>{team.name}</Link></td>
          <td data-label="League">{team.league}</td>
          <td data-label="Region">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              {flag && <Image src={`/flags/${flag.code}.png`} width={24} height={18} unoptimized alt="" title={flag.label} />}
              {team.region}
            </span>
          </td>
        </tr>;
      }) : <tr><td colSpan={columns.length} className={styles.empty}>No external references enabled.</td></tr>}</tbody>
    </table>
  </div>;
}
