import path from "node:path";

export const SNAPSHOT_ID = "leaguepedia-2026-08-03";
export const SNAPSHOT_SOURCE = "leaguepedia";
export const SNAPSHOT_CAPTURED_DATE = "2026-08-03";
export const SNAPSHOT_CUTOFF_LOCAL = "2026-08-03T23:59:59-03:00";
export const SNAPSHOT_CUTOFF_UTC = "2026-08-04T02:59:59Z";
export const SNAPSHOT_EFFECTIVE_UNIVERSE_PERIOD = "end-of-2026-season";
export const SNAPSHOT_NEXT_REVIEW_PERIOD = "2027-midseason";

export const LEAGUEPEDIA_API_BASE = "https://lol.fandom.com/api.php";
export const IMPORTER_VERSION = "1.0.0";
export const USER_AGENT =
  "KairosDBImporter/1.0 (lemackdev/kairos-universe; Leaguepedia snapshot research)";

export const CARGO_PAGE_SIZE = 500;
export const MEDIAWIKI_TITLES_BATCH_SIZE = 50;

export const MIN_REQUEST_INTERVAL_MS = 800;
export const MAX_CONCURRENCY = 2;
export const REQUEST_TIMEOUT_MS = 20_000;
export const MAX_RETRIES = 6;
export const RETRY_BASE_DELAY_MS = 2_000;
export const RETRY_MAX_DELAY_MS = 60_000;

const kairosdbRoot = process.cwd();
export const repositoryRoot = path.resolve(kairosdbRoot, "..");

export const externalDataRoot = path.join(
  repositoryRoot,
  "external-data",
  "leaguepedia",
);
export const importPolicyPath = path.join(externalDataRoot, "import-policy.json");
export const snapshotRoot = path.join(
  externalDataRoot,
  "snapshots",
  SNAPSHOT_ID,
);
export const rawCargoRoot = path.join(snapshotRoot, "raw", "cargo");
export const rawMediawikiRoot = path.join(snapshotRoot, "raw", "mediawiki");
export const normalizedRoot = path.join(snapshotRoot, "normalized");
export const indexesRoot = path.join(snapshotRoot, "indexes");
export const reportsRoot = path.join(snapshotRoot, "reports");
export const snapshotJsonPath = path.join(snapshotRoot, "snapshot.json");
export const manifestJsonPath = path.join(snapshotRoot, "manifest.json");
export const sourcePagesJsonPath = path.join(snapshotRoot, "source-pages.json");
export const checksumsJsonPath = path.join(snapshotRoot, "checksums.json");
export const checkpointJsonPath = path.join(snapshotRoot, ".checkpoint.json");

export const overridesRoot = path.join(
  repositoryRoot,
  "data",
  "competitive-world-overrides",
);
