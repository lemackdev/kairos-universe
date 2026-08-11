import { CARGO_PAGE_SIZE, rawCargoRoot } from "./config";
import { readRawResponse, sha256, writeRawResponse, rawResponseExists } from "./cache";
import { fetchLeaguepediaJson } from "./http";
import { ImportManifest } from "./manifest";

export interface CargoQueryParams {
  tables: string;
  fields: string;
  where?: string;
  joinOn?: string;
  groupBy?: string;
  /** Required: Cargo pagination is only deterministic with an explicit,
   * stable sort. Callers must include a tiebreaker unique per row. */
  orderBy: string;
  limit?: number;
}

interface CargoResponse {
  cargoquery: Array<{ title: Record<string, string> }>;
}

/**
 * Runs a Cargo query to completion, following pagination via limit/offset
 * until a page returns fewer rows than requested. Every page's raw response
 * is cached to disk under a deterministic name derived from `queryName` and
 * the page offset, so re-running the same import step is a no-op cache hit
 * instead of a fresh network request.
 */
export async function cargoQueryAll(
  queryName: string,
  params: CargoQueryParams,
  manifest: ImportManifest,
): Promise<Array<Record<string, string>>> {
  const limit = params.limit ?? CARGO_PAGE_SIZE;
  const rows: Array<Record<string, string>> = [];
  let offset = 0;

  for (;;) {
    const pageName = `${queryName}__offset-${offset}`;
    const requestParams: Record<string, string> = {
      action: "cargoquery",
      tables: params.tables,
      fields: params.fields,
      order_by: params.orderBy,
      limit: String(limit),
      offset: String(offset),
    };
    if (params.where) requestParams.where = params.where;
    if (params.joinOn) requestParams.join_on = params.joinOn;
    if (params.groupBy) requestParams.group_by = params.groupBy;

    let body: CargoResponse;
    let fromCache = false;

    if (rawResponseExists(rawCargoRoot, pageName)) {
      body = readRawResponse<CargoResponse>(
        `${rawCargoRoot}/${pageName}.json`,
      ) as CargoResponse;
      fromCache = true;
    } else {
      body = await fetchLeaguepediaJson<CargoResponse>(requestParams);
    }

    const pageRows = (body.cargoquery ?? []).map((r) => r.title);
    const { filePath, checksum } = writeRawResponse(
      rawCargoRoot,
      pageName,
      body,
    );

    manifest.record({
      kind: "cargo",
      description: `${queryName} (offset ${offset}, limit ${limit}${fromCache ? ", cached" : ""})`,
      requestUrl: new URL(
        "https://lol.fandom.com/api.php?" +
          new URLSearchParams({ ...requestParams, format: "json" }).toString(),
      ).toString(),
      rawFile: filePath,
      rowCount: pageRows.length,
      checksum,
      issuedAt: new Date().toISOString(),
    });

    rows.push(...pageRows);

    if (pageRows.length < limit) break;
    offset += limit;
  }

  return rows;
}

export function checksumRows(rows: Array<Record<string, string>>): string {
  return sha256(JSON.stringify(rows));
}
