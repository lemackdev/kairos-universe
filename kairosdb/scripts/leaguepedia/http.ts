import {
  LEAGUEPEDIA_API_BASE,
  MAX_CONCURRENCY,
  MAX_RETRIES,
  MIN_REQUEST_INTERVAL_MS,
  REQUEST_TIMEOUT_MS,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
  USER_AGENT,
} from "./config";

export class LeaguepediaApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "LeaguepediaApiError";
  }
}

export interface FetchAttemptLog {
  url: string;
  attempt: number;
  status: "ok" | "retry" | "failed";
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
  waitedMs?: number;
  timestamp: string;
}

/** Simple in-process rate limiter: bounded concurrency plus a minimum gap
 * between requests. Not distributed and not meant to be — this importer is
 * designed to run as a single sequential/low-concurrency process. */
class RateLimiter {
  private active = 0;
  private lastStart = 0;
  private queue: Array<() => void> = [];

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const tryStart = () => {
        if (this.active >= MAX_CONCURRENCY) {
          return false;
        }
        const now = Date.now();
        const elapsed = now - this.lastStart;
        if (elapsed < MIN_REQUEST_INTERVAL_MS) {
          setTimeout(tryStart, MIN_REQUEST_INTERVAL_MS - elapsed);
          return true;
        }
        this.active += 1;
        this.lastStart = now;
        resolve(() => {
          this.active -= 1;
          const next = this.queue.shift();
          if (next) next();
        });
        return true;
      };

      if (!tryStart()) {
        this.queue.push(tryStart);
      }
    });
  }
}

const limiter = new RateLimiter();

export const requestLog: FetchAttemptLog[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt: number): number {
  const exp = Math.min(
    RETRY_MAX_DELAY_MS,
    RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
  );
  const jitter = Math.floor(Math.random() * 500);
  return exp + jitter;
}

/**
 * Fetch a Leaguepedia API URL with rate limiting, a request timeout, and
 * bounded exponential-backoff retry. Retries on network errors, HTTP 5xx,
 * HTTP 429, and the MediaWiki/Cargo "ratelimited" error code. Gives up after
 * MAX_RETRIES attempts rather than retrying forever.
 */
export async function fetchLeaguepediaJson<T>(
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(LEAGUEPEDIA_API_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("format", "json");
  const href = url.toString();

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const release = await limiter.acquire();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(href, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      release();

      if (response.status === 429 || response.status >= 500) {
        const waited = backoffDelay(attempt);
        requestLog.push({
          url: href,
          attempt,
          status: "retry",
          httpStatus: response.status,
          waitedMs: waited,
          timestamp: new Date().toISOString(),
        });
        await sleep(waited);
        continue;
      }

      const body = (await response.json()) as {
        error?: { code: string; info: string };
      } & T;

      if (body && typeof body === "object" && "error" in body && body.error) {
        const { code, info } = body.error;
        const retryable = code === "ratelimited" || code === "maxlag";
        if (retryable && attempt < MAX_RETRIES) {
          const waited = backoffDelay(attempt);
          requestLog.push({
            url: href,
            attempt,
            status: "retry",
            errorCode: code,
            errorMessage: info,
            waitedMs: waited,
            timestamp: new Date().toISOString(),
          });
          await sleep(waited);
          continue;
        }
        requestLog.push({
          url: href,
          attempt,
          status: "failed",
          errorCode: code,
          errorMessage: info,
          timestamp: new Date().toISOString(),
        });
        throw new LeaguepediaApiError(info, code, retryable);
      }

      requestLog.push({
        url: href,
        attempt,
        status: "ok",
        httpStatus: response.status,
        timestamp: new Date().toISOString(),
      });
      return body as T;
    } catch (error) {
      clearTimeout(timeout);
      release();
      lastError = error;
      if (error instanceof LeaguepediaApiError && !error.retryable) {
        throw error;
      }
      const waited = backoffDelay(attempt);
      requestLog.push({
        url: href,
        attempt,
        status: "retry",
        errorMessage: error instanceof Error ? error.message : String(error),
        waitedMs: waited,
        timestamp: new Date().toISOString(),
      });
      if (attempt < MAX_RETRIES) {
        await sleep(waited);
      }
    }
  }

  requestLog.push({
    url: href,
    attempt: MAX_RETRIES,
    status: "failed",
    errorMessage:
      lastError instanceof Error ? lastError.message : String(lastError),
    timestamp: new Date().toISOString(),
  });
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch ${href} after ${MAX_RETRIES} attempts`);
}
