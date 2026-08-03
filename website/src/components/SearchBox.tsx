"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";

import type { SearchRecord } from "@/types/catalog";
import { searchRecords } from "@/lib/search/search";

export function SearchBox({ records }: { records: SearchRecord[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = searchRecords(records, deferredQuery);

  return (
    <div>
      <label className="searchForm">
        <span className="srOnly">Search Kairospedia</span>
        <input
          className="searchInput"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 404, Moss, Kairos, Aphromoo..."
          autoComplete="off"
        />
      </label>
      <p className="searchHint" aria-live="polite">
        {results.length} published {results.length === 1 ? "record" : "records"}
      </p>
      <SearchResults records={results} />
    </div>
  );
}

export function SearchResults({ records }: { records: SearchRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="searchResults">
        <p className="muted">No published entity matches this search.</p>
      </div>
    );
  }

  return (
    <div className="searchResults">
      {records.map((record) => (
        <Link className="searchResult" href={record.href} key={record.id}>
          <span className="searchResultType">{record.type}</span>
          <span>
            <strong>{record.name}</strong>
            <span className="entityName">
              <small>{record.subtitle}</small>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
