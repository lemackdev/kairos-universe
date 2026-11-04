import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import styles from "@/components/publications/publications.module.css";
import { getCatalog } from "@/lib/canon/server";
import { asterionUrl } from "@/lib/links";
import {
  articleTypeLabels,
  formatShortDate,
  publisherCategoryLabels,
} from "@/lib/publications/labels";

export const dynamicParams = false;

export function generateStaticParams() {
  return (getCatalog().publications?.publishers ?? []).map((publisher) => ({ slug: publisher.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const publisher = getCatalog().publications?.publishers.find((p) => p.slug === slug);
  return publisher ? { title: publisher.name, description: publisher.description } : {};
}

export default async function PublisherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publications = getCatalog().publications;
  const publisher = publications?.publishers.find((p) => p.slug === slug);
  if (!publications || !publisher) notFound();
  const articles = publications.articles.filter((a) => a.publisherId === publisher.id);
  const authors = publications.authors.filter((a) => a.publisherIds.includes(publisher.id));
  const asterionLink = publisher.organization?.id === "asterion-intelligence" ? asterionUrl("/") : null;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Publications", href: "/wiki/publications" },
          { label: publisher.name },
        ]}
      />
      <header className={styles.publisherHead}>
        <span className={styles.kicker}>{publisherCategoryLabels[publisher.category]}</span>
        <h1>{publisher.name}</h1>
        <p className={styles.leadDeck}>{publisher.description}</p>
        {publisher.coverageDisclosure ? (
          <p className={styles.disclosure} role="note">{publisher.coverageDisclosure}</p>
        ) : null}
        <div className={styles.meta}>
          <span>
            {publisher.articleCount} {publisher.articleCount === 1 ? "publication" : "publications"}
          </span>
          {publisher.organization?.href ? (
            <Link href={publisher.organization.href}>{publisher.organization.label}</Link>
          ) : null}
          {asterionLink ? <a href={asterionLink}>Asterion Intelligence website</a> : null}
        </div>
        {authors.length > 0 ? (
          <div className={styles.meta}>
            {authors.map((author) => (
              <span key={author.id}>
                {author.name}, {author.role}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <ul className={styles.rows}>
        {articles.map((article) => (
          <li key={article.id} className={styles.row}>
            <span className={styles.rowDate}>{formatShortDate(article.publicationDate)}</span>
            <div>
              <h2 className={styles.rowTitle}>
                <Link href={`/wiki/publications/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className={styles.rowSummary}>{article.subtitle ?? article.summary}</p>
              <div className={styles.meta}>
                <span>{articleTypeLabels[article.articleType]}</span>
                <span>{article.bylineText}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
