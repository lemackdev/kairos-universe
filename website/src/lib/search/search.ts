import type { SearchRecord } from "@/types/catalog";

export function searchRecords(
  records: SearchRecord[],
  query: string,
): SearchRecord[] {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) return records;

  return records
    .map((record) => {
      const terms = record.terms.map(normalizeSearch);
      const score = Math.max(
        ...terms.map((term, index) => {
          const primary = index <= 2;
          if (term === normalizedQuery) return primary ? 6 : 3;
          if (term.startsWith(normalizedQuery)) return primary ? 5 : 2;
          if (term.includes(normalizedQuery)) return primary ? 4 : 1;
          return 0;
        }),
      );
      return { record, score };
    })
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.record.name.localeCompare(b.record.name),
    )
    .map((result) => result.record);
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en-US");
}
