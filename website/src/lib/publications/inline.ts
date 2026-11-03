import type { ContentBlock, EntityKind } from "@/types/publications";

export const entityKinds: readonly EntityKind[] = [
  "organization",
  "team",
  "player",
  "staff",
  "competition",
  "game",
];

const TOKEN = /\[\[(organization|team|player|staff|competition|game):([a-z0-9]+(?:-[a-z0-9]+)*)\|([^\]]+)\]\]/g;

export type InlineSegment =
  | { type: "text"; text: string }
  | { type: "entity"; kind: EntityKind; id: string; label: string };

/** Splits authoring text with [[kind:id|label]] tokens into text and entity segments. */
export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) segments.push({ type: "text", text: text.slice(cursor, index) });
    segments.push({
      type: "entity",
      kind: match[1] as EntityKind,
      id: match[2]!,
      label: match[3]!.trim(),
    });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) segments.push({ type: "text", text: text.slice(cursor) });
  return segments;
}

/** Text with tokens replaced by their labels. Used for search, reading time, and metadata. */
export function plainText(text: string): string {
  return text.replace(TOKEN, (_all, _kind, _id, label: string) => label.trim());
}

/** Every string in a block that may contain tokens. */
export function blockTexts(block: ContentBlock): string[] {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return [block.text];
    case "pullQuote":
      return block.attribution ? [block.text, block.attribution] : [block.text];
    case "list":
      return block.items;
    case "image":
      return block.caption ? [block.caption] : [];
    case "factBox":
      return block.rows.map((row) => row.value);
    case "embed":
      return block.note ? [block.note] : [];
  }
}

export function extractEntityRefs(
  blocks: ContentBlock[],
): Array<{ kind: EntityKind; id: string; label: string }> {
  const found: Array<{ kind: EntityKind; id: string; label: string }> = [];
  for (const block of blocks) {
    for (const text of blockTexts(block)) {
      for (const segment of parseInline(text)) {
        if (segment.type === "entity") {
          found.push({ kind: segment.kind, id: segment.id, label: segment.label });
        }
      }
    }
  }
  return found;
}

export function bodyWordCount(blocks: ContentBlock[]): number {
  const words = blocks
    .flatMap(blockTexts)
    .map(plainText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}
