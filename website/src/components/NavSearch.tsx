"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { SearchEntityType, SearchRecord } from "@/types/catalog";
import { searchRecords } from "@/lib/search/search";

const GROUP_LABELS: Record<SearchEntityType, string> = {
  player: "Players",
  staff: "Staff",
  team: "Teams",
  competition: "Tournaments",
  organization: "Organizations",
  game: "Games",
  publication: "Publications",
};

const GROUP_ORDER: SearchEntityType[] = ["player", "team", "staff", "competition", "organization", "game", "publication"];
const MAX_PER_GROUP = 4;

export function NavSearch({ records }: { records: SearchRecord[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const trimmed = query.trim();
  const results = useMemo(() => (trimmed ? searchRecords(records, trimmed) : []), [records, trimmed]);

  const grouped = useMemo(() => {
    const groups = new Map<SearchEntityType, SearchRecord[]>();
    for (const record of results) {
      if (!groups.has(record.type)) groups.set(record.type, []);
      groups.get(record.type)!.push(record);
    }
    return groups;
  }, [results]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goToSearchPage() {
    setOpen(false);
    router.push(trimmed ? `/wiki/search?q=${encodeURIComponent(trimmed)}` : "/wiki/search");
  }

  return (
    <div className="navSearch" ref={containerRef}>
      <label className="navSearchForm">
        <span className="srOnly">Search Kairospedia</span>
        <input
          className="navSearchInput"
          type="search"
          value={query}
          placeholder="Search players, teams, tournaments..."
          autoComplete="off"
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") { event.preventDefault(); goToSearchPage(); }
            if (event.key === "Escape") setOpen(false);
          }}
        />
      </label>
      {open && trimmed && (
        <div className="navSearchDropdown">
          {results.length === 0
            ? <p className="navSearchEmpty">No published entity matches this search.</p>
            : GROUP_ORDER.filter((type) => grouped.has(type)).map((type) => (
              <div className="navSearchGroup" key={type}>
                <span className="navSearchGroupLabel">{GROUP_LABELS[type]}</span>
                {grouped.get(type)!.slice(0, MAX_PER_GROUP).map((record) => (
                  <Link className="navSearchResult" href={record.href} key={record.id} onClick={() => setOpen(false)}>
                    {record.type === "player"
                      ? <span className="searchResultPortrait navSearchPortrait">
                          {record.portraitUrl
                            ? <img src={record.portraitUrl} alt="" />
                            : <span className="searchResultPortraitFallback" aria-hidden="true">{record.name.slice(0, 1)}</span>}
                        </span>
                      : null}
                    <span>
                      <span className="searchResultName">
                        {record.flagCode && <img className="searchResultFlag" src={`/flags/${record.flagCode}.${record.flagCode === "pr" ? "svg" : "png"}`} alt={record.flagLabel ?? ""} />}
                        <strong>{record.name}</strong>
                      </span>
                      <span className="navSearchResultSubtitle">{record.playingFor ? `Playing for ${record.playingFor}` : record.subtitle}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          <button type="button" className="navSearchAll" onClick={goToSearchPage}>
            Search all results for &ldquo;{trimmed}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
