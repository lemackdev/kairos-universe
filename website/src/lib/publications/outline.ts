import type { ContentBlock } from "@/types/publications";

import { plainText } from "./inline";

export interface OutlineEntry {
  /** Index of the heading block in the content array. */
  blockIndex: number;
  id: string;
  text: string;
  level: 2 | 3;
}

function slugify(text: string): string {
  return (
    plainText(text)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Heading anchors, unique within one article. */
export function buildOutline(blocks: ContentBlock[]): OutlineEntry[] {
  const used = new Map<string, number>();
  const entries: OutlineEntry[] = [];
  blocks.forEach((block, blockIndex) => {
    if (block.type !== "heading") return;
    const base = slugify(block.text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    entries.push({
      blockIndex,
      id: count === 0 ? base : `${base}-${count + 1}`,
      text: plainText(block.text),
      level: block.level,
    });
  });
  return entries;
}
