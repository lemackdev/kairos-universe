export type SearchEntryKind =
  | "kairos-player"
  | "external-player"
  | "kairos-team"
  | "external-team"
  | "organization"
  | "staff";

export interface SearchEntry {
  id: string;
  kind: SearchEntryKind;
  label: string;
  subtitle: string;
  href: string;
  keywords: string[];
}

/** Strips diacritics so accented Latin names (e.g. "Rekkles" vs a name with
 * an acute accent) match their unaccented search query, and lowercases for
 * case-insensitive matching. Romanized Korean/Chinese nicknames already
 * arrive as plain Latin-script strings from Leaguepedia, so no separate
 * transliteration step is needed here. */
export function foldAccents(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function searchEntries(
  index: SearchEntry[],
  rawQuery: string,
  limit = 30,
): SearchEntry[] {
  const query = foldAccents(rawQuery.trim());
  if (query.length === 0) return [];

  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of index) {
    let best = -1;
    for (const keyword of entry.keywords) {
      if (keyword === query) {
        best = Math.max(best, 100);
      } else if (keyword.startsWith(query)) {
        best = Math.max(best, 75);
      } else if (keyword.includes(query)) {
        best = Math.max(best, 40);
      }
    }
    if (best > 0) scored.push({ entry, score: best });
  }

  scored.sort((a, b) => b.score - a.score || a.entry.label.localeCompare(b.entry.label));
  return scored.slice(0, limit).map((s) => s.entry);
}
