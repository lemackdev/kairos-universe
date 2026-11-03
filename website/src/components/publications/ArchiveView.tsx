"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { ArticleType, AuthorView, PublisherView } from "@/types/publications";
import {
  emptyFilters,
  filterPublications,
  groupByMonth,
  hasActiveFilters,
  pickFeatured,
  type ArchiveFilters,
  type PublicationListItem,
} from "@/lib/publications/filter";
import {
  articleTypeLabels,
  articleTypeOrder,
  classificationLabels,
  formatLongDate,
  formatMonthYear,
  formatShortDate,
} from "@/lib/publications/labels";

import styles from "./publications.module.css";

const entityKindLabels: Record<string, string> = {
  organization: "Organizations",
  team: "Teams",
  player: "Players",
  staff: "Staff",
  competition: "Competitions",
  game: "Games",
};

function fromParams(params: URLSearchParams): ArchiveFilters {
  const type = params.get("type") ?? "";
  return {
    query: params.get("q") ?? "",
    type: (articleTypeOrder as string[]).includes(type) ? (type as ArticleType) : "",
    publisherId: params.get("publisher") ?? "",
    entityKey: params.get("about") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
}

function toQuery(filters: ArchiveFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.publisherId) params.set("publisher", filters.publisherId);
  if (filters.entityKey) params.set("about", filters.entityKey);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  const text = params.toString();
  return text ? `?${text}` : "";
}

function Meta({ item }: { item: PublicationListItem }) {
  return (
    <div className={styles.meta}>
      <span>{item.publisherName}</span>
      <span>{articleTypeLabels[item.articleType]}</span>
      <span>{item.bylineText}</span>
      {item.classification !== "in-universe-publication" ? (
        <span>{classificationLabels[item.classification]}</span>
      ) : null}
      {item.status === "draft" ? <span className={styles.draftTag}>Draft</span> : null}
    </div>
  );
}

export function ArchiveView({
  items,
  publishers,
  authors,
}: {
  items: PublicationListItem[];
  publishers: Array<Pick<PublisherView, "id" | "slug" | "name" | "articleCount">>;
  authors: Array<Pick<AuthorView, "id" | "name" | "role" | "articleCount">>;
}) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ArchiveFilters>(() => fromParams(searchParams));

  const update = (patch: Partial<ArchiveFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    window.history.replaceState(null, "", `${window.location.pathname}${toQuery(next)}`);
  };
  const reset = () => update(emptyFilters);

  const active = hasActiveFilters(filters);
  const results = useMemo(() => filterPublications(items, filters), [items, filters]);
  const groups = useMemo(() => groupByMonth(results), [results]);

  const presentTypes = articleTypeOrder.filter((type) => items.some((i) => i.articleType === type));
  const entityOptions = useMemo(() => {
    const seen = new Map<string, { key: string; kind: string; label: string }>();
    for (const item of items) for (const e of item.entities) seen.set(e.key, e);
    return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [items]);

  const featured = pickFeatured(items);
  const latest = items.filter((i) => i.id !== featured?.id).slice(0, 5);

  return (
    <>
      {!active && featured ? (
        <section className={styles.front} aria-label="Front page">
          <div>
            <span className={styles.kicker}>Featured</span>
            {featured.coverPath ? (
              <figure className={styles.cover} style={{ marginTop: "0.75rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.coverPath} alt={featured.coverAlt ?? ""} />
              </figure>
            ) : null}
            <h2 className={styles.leadTitle}>
              <Link href={`/wiki/publications/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p className={styles.leadDeck}>{featured.subtitle ?? featured.summary}</p>
            <Meta item={featured} />
            <div className={styles.meta}>
              <span>{formatLongDate(featured.publicationDate)}</span>
              <span>{featured.readingMinutes} min read</span>
            </div>
          </div>
          {latest.length > 0 ? (
            <div className={styles.frontLatest}>
              <h2 className={styles.latestHeading}>Latest</h2>
              <ul className={styles.latestList}>
                {latest.map((item) => (
                  <li key={item.id} className={styles.latestItem}>
                    <span className={styles.rowDate}>
                      {formatShortDate(item.publicationDate)} / {articleTypeLabels[item.articleType]}
                    </span>
                    <h3>
                      <Link href={`/wiki/publications/${item.slug}`}>{item.title}</Link>
                    </h3>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={styles.filters} aria-label="Filter the archive">
        <div className={styles.filterRow}>
          <label className={styles.field}>
            <span>Search</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Headline, byline, publisher, entity..."
              autoComplete="off"
            />
          </label>
          <label className={styles.field}>
            <span>Publisher</span>
            <select
              value={filters.publisherId}
              onChange={(event) => update({ publisherId: event.target.value })}
            >
              <option value="">All publishers</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.articleCount})
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>About</span>
            <select
              value={filters.entityKey}
              onChange={(event) => update({ entityKey: event.target.value })}
            >
              <option value="">Any organization, team, player, game</option>
              {Object.keys(entityKindLabels).map((kind) => {
                const options = entityOptions.filter((o) => o.kind === kind);
                return options.length === 0 ? null : (
                  <optgroup key={kind} label={entityKindLabels[kind]}>
                    {options.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
        </div>
        <div className={`${styles.filterRow} ${styles.filterRowDates}`}>
          <label className={styles.field}>
            <span>From</span>
            <input type="date" value={filters.from} onChange={(event) => update({ from: event.target.value })} />
          </label>
          <label className={styles.field}>
            <span>To</span>
            <input type="date" value={filters.to} onChange={(event) => update({ to: event.target.value })} />
          </label>
        </div>
        <div className={styles.chips} role="group" aria-label="Category">
          <button
            type="button"
            className={styles.chip}
            aria-pressed={filters.type === ""}
            onClick={() => update({ type: "" })}
          >
            All
          </button>
          {presentTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={styles.chip}
              aria-pressed={filters.type === type}
              onClick={() => update({ type: filters.type === type ? "" : type })}
            >
              {articleTypeLabels[type]}
            </button>
          ))}
        </div>
        <div className={styles.resultBar}>
          <span aria-live="polite">
            {results.length} of {items.length} {items.length === 1 ? "publication" : "publications"}
          </span>
          {active ? (
            <button type="button" className={styles.linkButton} onClick={reset}>
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <div className={styles.archive}>
        <div>
          {results.length === 0 ? (
            <div className={styles.empty}>
              <h2>Nothing matches these filters.</h2>
              <p>
                Try a broader search, a different date range, or{" "}
                <button type="button" className={styles.linkButton} onClick={reset}>
                  clear every filter
                </button>
                .
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key} aria-label={group.key === "undated" ? "Undated" : formatMonthYear(`${group.key}-01`)}>
                <h2 className={styles.monthHeading}>
                  {group.key === "undated" ? "Undated" : formatMonthYear(`${group.key}-01`)}
                </h2>
                <ul className={styles.rows}>
                  {group.items.map((item) => (
                    <li key={item.id} className={styles.row}>
                      <span className={styles.rowDate}>{formatShortDate(item.publicationDate)}</span>
                      <div>
                        <h3 className={styles.rowTitle}>
                          <Link href={`/wiki/publications/${item.slug}`}>{item.title}</Link>
                        </h3>
                        <p className={styles.rowSummary}>{item.subtitle ?? item.summary}</p>
                        <Meta item={item} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <aside className={styles.rail} aria-label="Publishers and bylines">
          <section aria-labelledby="rail-publishers">
            <h2 className={styles.railHeading} id="rail-publishers">
              Publishers
            </h2>
            <ul className={styles.railList}>
              {publishers.map((p) => (
                <li key={p.id}>
                  <Link href={`/wiki/publications/publishers/${p.slug}`}>{p.name}</Link>
                  <small>{p.articleCount}</small>
                </li>
              ))}
            </ul>
          </section>
          {authors.length > 0 ? (
            <section aria-labelledby="rail-authors">
              <h2 className={styles.railHeading} id="rail-authors">
                Bylines
              </h2>
              <ul className={styles.railList}>
                {authors.map((a) => (
                  <li key={a.id}>
                    <span>
                      {a.name}
                      <br />
                      <small>{a.role}</small>
                    </span>
                    <small>{a.articleCount}</small>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
