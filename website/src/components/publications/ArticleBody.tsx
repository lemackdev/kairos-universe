import Link from "next/link";
import type { ReactNode } from "react";

import type { ContentBlock, ResolvedEntity } from "@/types/publications";
import { parseInline } from "@/lib/publications/inline";
import { buildOutline } from "@/lib/publications/outline";

import styles from "./publications.module.css";

function InlineText({ text, entities }: { text: string; entities: Map<string, ResolvedEntity> }) {
  return (
    <>
      {parseInline(text).map((segment, index) => {
        if (segment.type === "text") return segment.text;
        const entity = entities.get(`${segment.kind}:${segment.id}`);
        return entity?.href ? (
          <Link key={index} href={entity.href}>
            {segment.label}
          </Link>
        ) : (
          <span key={index}>{segment.label}</span>
        );
      })}
    </>
  );
}

function renderBlock(
  block: ContentBlock,
  index: number,
  entities: Map<string, ResolvedEntity>,
  headingId: string | undefined,
): ReactNode {
  const inline = (text: string) => <InlineText text={text} entities={entities} />;

  switch (block.type) {
    case "paragraph":
      return <p key={index}>{inline(block.text)}</p>;
    case "heading": {
      const Tag = block.level === 2 ? "h2" : "h3";
      return (
        <Tag key={index} id={headingId}>
          {inline(block.text)}
        </Tag>
      );
    }
    case "pullQuote":
      return (
        <blockquote key={index} className={styles.pull}>
          <p>{inline(block.text)}</p>
          {block.attribution ? <footer>{inline(block.attribution)}</footer> : null}
        </blockquote>
      );
    case "list": {
      const Tag = block.style === "numbered" ? "ol" : "ul";
      return (
        <Tag key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </Tag>
      );
    }
    case "image":
      return (
        <figure key={index} className={styles.figure}>
          {/* Fixed archive assets; dimensions vary by file, so a plain img keeps natural ratio. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.path} alt={block.alt} loading="lazy" />
          <figcaption>
            {block.caption ? <span>{inline(block.caption)}</span> : null}
            <small>{block.credit}</small>
          </figcaption>
        </figure>
      );
    case "embed":
      return (
        <div key={index} className={styles.embed}>
          <strong>{block.title}</strong>
          {block.availability === "available" && block.url ? (
            <a href={block.url} target="_blank" rel="noopener noreferrer">
              {block.kind === "video" ? "Watch" : block.kind === "audio" ? "Listen" : "Open"} (opens in a new tab)
            </a>
          ) : (
            <span>
              {block.availability === "not-yet-published"
                ? "This media has not been published yet."
                : "This media is not available."}
            </span>
          )}
          {block.note ? <span>{inline(block.note)}</span> : null}
        </div>
      );
    case "factBox":
      return (
        <aside key={index} className={styles.factBox} aria-label={block.title}>
          <h3>{block.title}</h3>
          <dl>
            {block.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{inline(row.value)}</dd>
              </div>
            ))}
          </dl>
        </aside>
      );
  }
}

export function ArticleBody({
  blocks,
  entities,
}: {
  blocks: ContentBlock[];
  entities: ResolvedEntity[];
}) {
  const map = new Map(entities.map((e) => [`${e.kind}:${e.id}`, e]));
  const ids = new Map(buildOutline(blocks).map((entry) => [entry.blockIndex, entry.id]));

  return (
    <div className={styles.body}>
      {blocks.map((block, index) => renderBlock(block, index, map, ids.get(index)))}
    </div>
  );
}
