import { Suspense } from "react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArchiveView } from "@/components/publications/ArchiveView";
import styles from "@/components/publications/publications.module.css";
import { getCatalog } from "@/lib/canon/server";
import { toListItem } from "@/lib/publications/filter";
import { formatMonthYear } from "@/lib/publications/labels";

export const metadata = {
  title: "Publications",
  description:
    "The fictional media archive of the Kairos Universe: news, interviews, features, and announcements, kept apart from real-world journalism.",
};

export default function PublicationsPage() {
  const publications = getCatalog().publications;
  const articles = publications?.articles ?? [];
  const publishers = publications?.publishers ?? [];
  const dated = articles.map((a) => a.publicationDate).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const span =
    dated.length > 0
      ? dated[0]!.slice(0, 7) === dated[dated.length - 1]!.slice(0, 7)
        ? formatMonthYear(`${dated[0]!.slice(0, 7)}-01`)
        : `${formatMonthYear(`${dated[0]!.slice(0, 7)}-01`)} to ${formatMonthYear(`${dated[dated.length - 1]!.slice(0, 7)}-01`)}`
      : null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Kairospedia", href: "/wiki" }, { label: "Publications" }]} />

      <header className={styles.masthead}>
        <div className={styles.mastheadTop}>
          <span>Media archive</span>
          <span>
            {articles.length} {articles.length === 1 ? "publication" : "publications"} / {publishers.length}{" "}
            {publishers.length === 1 ? "publisher" : "publishers"}
            {span ? ` / ${span}` : ""}
          </span>
        </div>
        <h1 className={styles.mastheadTitle}>Publications</h1>
        <p className={styles.mastheadLede}>
          The press, interviews, and announcements that surround Kairos Esports, Asterion
          Intelligence, and the competitive world they play in.
        </p>
        <p className={styles.notice}>
          <strong>Read this first</strong>
          <span>
            Every publication here is fiction written for the Kairos Universe. Real-world outlets
            and people are portrayed only where labelled, and fictional coverage is never real
            reporting.
          </span>
        </p>
      </header>

      {articles.length === 0 ? (
        <section className={styles.empty} aria-labelledby="empty-heading">
          <h2 id="empty-heading">The archive is empty.</h2>
          <p>
            No publications have been released in the story yet. Articles, interviews, and
            announcements appear here once they are established in canon.
          </p>
        </section>
      ) : (
        <Suspense fallback={null}>
          <ArchiveView
            items={articles.map(toListItem)}
            publishers={publishers.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              articleCount: p.articleCount,
            }))}
            authors={(publications?.authors ?? []).map((a) => ({
              id: a.id,
              name: a.name,
              role: a.role,
              articleCount: a.articleCount,
            }))}
          />
        </Suspense>
      )}
    </>
  );
}
