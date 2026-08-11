"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { searchEntries, type SearchEntry, type SearchEntryKind } from "@/lib/search/search";

const KIND_LABEL: Record<SearchEntryKind, string> = {
  "kairos-player": "Kairos original player",
  "external-player": "External snapshot player",
  "kairos-team": "Kairos original team",
  "external-team": "External snapshot team",
  organization: "Organization",
  staff: "Staff",
};

export function SearchBox({
  index,
  initialQuery = "",
}: {
  index: SearchEntry[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchEntries(index, query), [index, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search players, teams, organizations, staff…"
        aria-label="Search KairosDB"
        autoFocus
        style={{
          width: "100%",
          background: "var(--surface-raised)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          color: "var(--text)",
          padding: "0.65rem 0.9rem",
          fontSize: "15px",
          marginBottom: "1.25rem",
        }}
      />
      {query.trim().length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Start typing to search.</p>
      ) : results.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No results for &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {results.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.6rem 0.75rem",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <span>
                  <strong>{r.label}</strong>
                  <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                    {r.subtitle}
                  </span>
                </span>
                <span
                  className="badge"
                  style={{
                    background: "var(--surface-hover)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-strong)",
                  }}
                >
                  {KIND_LABEL[r.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
