import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { InfoboxRow } from "@/components/EntityInfobox";
import styles from "./WikiArticle.module.css";

export type ArticleSection = { id: string; title: string };

export function WikiArticle({ title, kind, game, sections, infobox, children }: {
  title: string; kind: "Teams" | "Players" | "Tournaments"; game: string;
  sections: ArticleSection[]; infobox: ReactNode; children: ReactNode;
}) {
  return <article className={`wikiArticle ${styles.article}`}>
    <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" },
      { label: kind, href: `/wiki/${kind === "Tournaments" ? "competitions" : kind.toLowerCase()}` }, { label: title }]} />
    <header className={styles.header}>
      <span className={styles.kicker}>{game} / {kind === "Teams" ? "Team" : kind === "Players" ? "Player" : "Tournament"}</span>
      <h1>{title}</h1>
      <span className={styles.edition}>Kairos Universe encyclopedia</span>
    </header>
    <nav className={styles.tabs} aria-label="Article sections">
      {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
    </nav>
    <div className={styles.layout}>
      <aside className={styles.aside}>
        {infobox}
        <details className={styles.contents} open>
          <summary>Contents</summary>
          <ol>{sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
        </details>
      </aside>
      <div className={styles.body}>{children}</div>
    </div>
  </article>;
}

export function ArticleSection({ id, title, children }: ArticleSection & { children: ReactNode }) {
  return <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`}>{title}<a href={`#${id}`} aria-label={`Link to ${title}`}>#</a></h2>
    {children}
  </section>;
}

export function ArticleInfobox({ title, monogram, groups, image }: {
  title: string; monogram: string; image?: ReactNode; groups: Array<{ title: string; rows: InfoboxRow[] }>;
}) {
  return <div className={styles.infobox}>
    <h2>{title}</h2>
    {image ? <div className={styles.monogram}>{image}</div> : <div className={styles.monogram} aria-label="No approved image available"><span>{monogram}</span></div>}
    {groups.map((group) => <div key={group.title}>
      <h3>{group.title}</h3>
      <dl>{group.rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value ?? "TBD"}</dd></div>)}</dl>
    </div>)}
  </div>;
}

export function WikiTable({ caption, columns, rows, empty }: {
  caption: string; columns: string[]; rows: Array<{ key: string; cells: ReactNode[] }>; empty: string;
}) {
  return <div className={styles.tableWrap}>
    <table className={styles.table}>
      <caption>{caption}</caption>
      <thead><tr>{columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row) => <tr key={row.key}>
        {row.cells.map((cell, index) => <td key={columns[index]} data-label={columns[index]}>{cell ?? "TBD"}</td>)}
      </tr>) : <tr><td colSpan={columns.length} className={styles.empty}>{empty}</td></tr>}</tbody>
    </table>
  </div>;
}

export function ArticleLink({ href, children }: { href: string | null; children: ReactNode }) {
  return href ? <Link href={href}>{children}</Link> : <>{children}</>;
}

export function Facts({ rows }: { rows: InfoboxRow[] }) {
  return <dl className={styles.facts}>{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value ?? "TBD"}</dd></div>)}</dl>;
}
