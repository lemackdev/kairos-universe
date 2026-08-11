import { MEDIAWIKI_TITLES_BATCH_SIZE, rawMediawikiRoot } from "./config";
import { readRawResponse, writeRawResponse, rawResponseExists } from "./cache";
import { fetchLeaguepediaJson } from "./http";
import { ImportManifest } from "./manifest";

export interface PageRevisionInfo {
  requestedTitle: string;
  resolvedTitle: string;
  pageId: number | null;
  namespace: number | null;
  redirectTarget: string | null;
  missing: boolean;
  revisionId: number | null;
  revisionTimestamp: string | null;
  retrievedAt: string;
}

interface MediaWikiQueryResponse {
  query?: {
    pages?: Record<
      string,
      {
        pageid?: number;
        ns?: number;
        title: string;
        missing?: string;
        revisions?: Array<{ revid: number; timestamp: string }>;
      }
    >;
    redirects?: Array<{ from: string; to: string }>;
    normalized?: Array<{ from: string; to: string }>;
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Batches page-title revision lookups (up to MEDIAWIKI_TITLES_BATCH_SIZE per
 * request) instead of issuing one request per page. Resolves redirects and
 * records page ID, revision ID, and revision timestamp for every title.
 */
export async function fetchPageRevisions(
  titles: string[],
  batchLabel: string,
  manifest: ImportManifest,
): Promise<PageRevisionInfo[]> {
  const uniqueTitles = Array.from(new Set(titles));
  const results: PageRevisionInfo[] = [];

  const batches = chunk(uniqueTitles, MEDIAWIKI_TITLES_BATCH_SIZE);
  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i] ?? [];
    const cacheName = `${batchLabel}__batch-${i}`;
    const requestParams: Record<string, string> = {
      action: "query",
      titles: batch.join("|"),
      prop: "revisions|info",
      rvprop: "ids|timestamp",
      redirects: "1",
    };

    let body: MediaWikiQueryResponse;
    let fromCache = false;
    if (rawResponseExists(rawMediawikiRoot, cacheName)) {
      body = readRawResponse<MediaWikiQueryResponse>(
        `${rawMediawikiRoot}/${cacheName}.json`,
      ) as MediaWikiQueryResponse;
      fromCache = true;
    } else {
      body = await fetchLeaguepediaJson<MediaWikiQueryResponse>(requestParams);
    }

    const { filePath, checksum } = writeRawResponse(
      rawMediawikiRoot,
      cacheName,
      body,
    );

    const redirectMap = new Map(
      (body.query?.redirects ?? []).map((r) => [r.from, r.to]),
    );
    const normalizedMap = new Map(
      (body.query?.normalized ?? []).map((n) => [n.from, n.to]),
    );

    const pages = Object.values(body.query?.pages ?? {});
    const retrievedAt = new Date().toISOString();

    for (const requestedTitle of batch) {
      const normalized = normalizedMap.get(requestedTitle) ?? requestedTitle;
      const redirectedTo = redirectMap.get(normalized) ?? null;
      const lookupTitle = redirectedTo ?? normalized;
      const page = pages.find((p) => p.title === lookupTitle);

      results.push({
        requestedTitle,
        resolvedTitle: page?.title ?? lookupTitle,
        pageId: page?.pageid ?? null,
        namespace: page?.ns ?? null,
        redirectTarget: redirectedTo,
        missing: page?.missing !== undefined || !page,
        revisionId: page?.revisions?.[0]?.revid ?? null,
        revisionTimestamp: page?.revisions?.[0]?.timestamp ?? null,
        retrievedAt,
      });
    }

    manifest.record({
      kind: "mediawiki",
      description: `${batchLabel} revisions batch ${i} (${batch.length} titles${fromCache ? ", cached" : ""})`,
      requestUrl: new URL(
        "https://lol.fandom.com/api.php?" +
          new URLSearchParams({ ...requestParams, format: "json" }).toString(),
      ).toString(),
      rawFile: filePath,
      rowCount: batch.length,
      checksum,
      issuedAt: new Date().toISOString(),
    });
  }

  return results;
}
