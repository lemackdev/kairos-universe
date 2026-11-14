import Link from "next/link";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CanonBadge } from "@/components/Badges";
import type {
  EntityKind,
  PublicationView,
  PublisherView,
  ResolvedEntity,
} from "@/types/publications";
import { asterionUrl } from "@/lib/links";
import {
  articleTypeLabels,
  classificationLabels,
  classificationNotes,
  formatLongDate,
} from "@/lib/publications/labels";
import { buildOutline } from "@/lib/publications/outline";

import { ArticleBody } from "./ArticleBody";
import styles from "./publications.module.css";

const kindLabels: Record<EntityKind, string> = {
  organization: "Organizations",
  team: "Teams",
  player: "Players",
  staff: "Staff",
  competition: "Competitions",
  game: "Games",
};

const kindOrder: EntityKind[] = ["organization", "team", "player", "staff", "competition", "game"];

const disclosureClass = {
  "in-universe-publication": styles.disclosureFictional,
  "official-announcement": styles.disclosureOfficial,
  "real-world-reference": styles.disclosureReal,
  rumor: styles.disclosureRumor,
} as const;

const correctionLabels = {
  correction: "Correction",
  update: "Update",
  "editors-note": "Editor's note",
} as const;

function groupEntities(entities: ResolvedEntity[]) {
  return kindOrder
    .map((kind) => ({ kind, items: entities.filter((e) => e.kind === kind) }))
    .filter((group) => group.items.length > 0);
}

export function ArticleView({
  article,
  publisher,
}: {
  article: PublicationView;
  publisher: PublisherView | undefined;
}) {
  const outline = buildOutline(article.content).filter((entry) => entry.level === 2);
  const grouped = groupEntities(article.entities);
  const asterionLink = article.entities.some((e) => e.kind === "organization" && e.id === "asterion-intelligence")
    ? asterionUrl("/")
    : null;
  const isDraft = article.publicationStatus === "draft";
  const showStoryDate =
    article.fictionalWorldDate !== "TBD" && article.fictionalWorldDate !== article.publicationDate;

  return (
    <article className={styles.article}>
      <Breadcrumbs
        items={[
          { label: "Kairospedia", href: "/wiki" },
          { label: "Publications", href: "/wiki/publications" },
          { label: article.title },
        ]}
      />

      {isDraft ? (
        <div className={`${styles.disclosure} ${styles.disclosureRumor}`} role="note">
          <strong>Draft preview</strong>
          <span>This record is a draft and is not part of the public archive.</span>
        </div>
      ) : null}

      {((article.classification === "rumor" && article.publisherId !== "the-competitive-ledger") ||
        (article.classification === "real-world-reference" && !["dust2-us", "riot-games-publisher", "ge-globo"].includes(article.publisherId)) ||
        (publisher?.coverageDisclosure && !["dust2-us", "riot-games-publisher", "ge-globo"].includes(publisher.id))) ? (
        <div className={`${styles.disclosure} ${disclosureClass[article.classification]}`} role="note">
          {article.classification !== "rumor" || article.publisherId !== "the-competitive-ledger" ? (
            <strong>{classificationLabels[article.classification]}</strong>
          ) : null}
          {classificationNotes[article.classification] ? <span>{classificationNotes[article.classification]}</span> : null}
          {publisher?.coverageDisclosure && !["dust2-us", "riot-games-publisher", "ge-globo"].includes(publisher.id) ? (
            <span>{publisher.coverageDisclosure}</span>
          ) : null}
        </div>
      ) : null}

      <header>
        <span className={styles.kicker}>
          {articleTypeLabels[article.articleType]}
          {publisher ? ` / ${publisher.name}` : ""}
        </span>
        <h1 className={styles.headline}>{article.title}</h1>
        {article.subtitle ? <p className={styles.deck}>{article.subtitle}</p> : null}
        <div className={styles.byline}>
          <span>
            By <strong>{article.bylineText}</strong>
          </span>
          {publisher ? (
            <span>
              <Link href={`/wiki/publications/publishers/${publisher.slug}`}>{publisher.name}</Link>
            </span>
          ) : null}
          <span>
            <time dateTime={/^\d{4}-/.test(article.publicationDate) ? article.publicationDate : undefined}>
              {formatLongDate(article.publicationDate)}
            </time>
          </span>
          <span>{article.readingMinutes} min read</span>
        </div>
      </header>

      {article.cover ? (
        <figure className={styles.figure}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover.path}
            alt={article.cover.alt}
            width={article.cover.width}
            height={article.cover.height}
          />
          <figcaption>
            <small>{article.cover.credit}</small>
          </figcaption>
        </figure>
      ) : null}

      <div className={styles.layout}>
        <div>
          <ArticleBody blocks={article.content} entities={article.entities} />

          {article.corrections.length > 0 ? (
            <section className={styles.corrections} aria-labelledby="corrections-heading">
              <h2 id="corrections-heading">Corrections and updates</h2>
              <ol>
                {article.corrections.map((c, i) => (
                  <li key={i}>
                    <time dateTime={/^\d{4}-/.test(c.date) ? c.date : undefined}>
                      {correctionLabels[c.kind]} / {formatLongDate(c.date)}
                    </time>
                    <p>{c.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <aside className={styles.articleRail} aria-label="Article details">
          {outline.length >= 3 ? (
            <nav aria-labelledby="toc-heading">
              <h2 className={styles.railHeading} id="toc-heading">
                In this article
              </h2>
              <ol className={styles.toc}>
                {outline.map((entry) => (
                  <li key={entry.id}>
                    <a href={`#${entry.id}`}>{entry.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <section aria-labelledby="continuity-heading">
            <h2 className={styles.railHeading} id="continuity-heading">
              Source and continuity
            </h2>
            <dl className={styles.facts}>
              <div>
                <dt>Canon status</dt>
                <dd>
                  <CanonBadge status={article.canonStatus.replaceAll("-", " ")} />
                </dd>
              </div>
              <div>
                <dt>Classification</dt>
                <dd>{classificationLabels[article.classification]}</dd>
              </div>
              {publisher ? (
                <div>
                  <dt>Publisher</dt>
                  <dd>
                    <Link href={`/wiki/publications/publishers/${publisher.slug}`}>{publisher.name}</Link>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Published (in universe)</dt>
                <dd>{formatLongDate(article.publicationDate)}</dd>
              </div>
              {showStoryDate ? (
                <div>
                  <dt>Story date</dt>
                  <dd>{formatLongDate(article.fictionalWorldDate)}</dd>
                </div>
              ) : null}
              <div>
                <dt>Record updated</dt>
                <dd>{formatLongDate(article.lastUpdated)}</dd>
              </div>
            </dl>
          </section>

          {article.realWorldCitation ? (
            <section aria-labelledby="citation-heading">
              <h2 className={styles.railHeading} id="citation-heading">
                Real-world citation
              </h2>
              <p>
                {article.realWorldCitation.title}, {article.realWorldCitation.publisherName}
                {article.realWorldCitation.date ? `, ${article.realWorldCitation.date}` : ""}.
              </p>
              {article.realWorldCitation.url ? (
                <p>
                  <a href={article.realWorldCitation.url} target="_blank" rel="noopener noreferrer">
                    Read the original (opens in a new tab)
                  </a>
                </p>
              ) : null}
            </section>
          ) : null}

          {grouped.length > 0 ? (
            <section aria-labelledby="related-heading">
              <h2 className={styles.railHeading} id="related-heading">
                In Kairospedia
              </h2>
              {grouped.map((group) => (
                <div key={group.kind} style={{ marginBottom: "0.9rem" }}>
                  <span className={styles.entityKind}>{kindLabels[group.kind]}</span>
                  <ul className={styles.entityList}>
                    {group.items.map((entity) => (
                      <li key={`${entity.kind}:${entity.id}`}>
                        {entity.href ? <Link href={entity.href}>{entity.label}</Link> : entity.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {asterionLink ? (
                <p>
                  <a href={asterionLink}>Asterion Intelligence website</a>
                </p>
              ) : null}
            </section>
          ) : null}

          {article.episodes.length > 0 ? (
            <section aria-labelledby="episodes-heading">
              <h2 className={styles.railHeading} id="episodes-heading">
                Episodes
              </h2>
              <ul className={styles.entityList}>
                {article.episodes.map((episode) => (
                  <li key={episode.id}>
                    Episode {episode.number}: {episode.title}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {article.sources.length > 0 ? (
            <section aria-labelledby="sources-heading">
              <h2 className={styles.railHeading} id="sources-heading">
                Sources
              </h2>
              <div>
                {article.sources.map((source) => (
                  <div key={source.id} className={styles.sourceItem}>
                    <span>{source.label}</span>
                    <small>{source.canonStatus.replaceAll("-", " ")}</small>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {article.imageCredits.length > 0 ? (
            <section aria-labelledby="credits-heading">
              <h2 className={styles.railHeading} id="credits-heading">
                Image credits
              </h2>
              <ul className={styles.entityList}>
                {article.imageCredits.map((credit) => (
                  <li key={credit}>{credit}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      {article.related.length > 0 ? (
        <section className={styles.more} aria-labelledby="more-heading">
          <h2 className={styles.railHeading} id="more-heading" style={{ borderBottom: 0 }}>
            More from the archive
          </h2>
          <ul className={styles.moreList}>
            {article.related.map((item) => (
              <li key={item.id}>
                <span className={styles.kicker}>
                  {item.publisherName} / {formatLongDate(item.publicationDate)}
                </span>
                <h3>
                  <Link href={`/wiki/publications/${item.slug}`}>{item.title}</Link>
                </h3>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
