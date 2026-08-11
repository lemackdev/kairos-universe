import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchLeaguepediaJson retry/rate-limit behavior", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    vi.resetModules();
    originalFetch = global.fetch;
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("retries on a ratelimited error and eventually succeeds", async () => {
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls += 1;
      if (calls < 3) {
        return {
          status: 200,
          json: async () => ({
            error: { code: "ratelimited", info: "slow down" },
          }),
        } as Response;
      }
      return {
        status: 200,
        json: async () => ({ ok: true }),
      } as Response;
    }) as unknown as typeof fetch;

    const { fetchLeaguepediaJson } = await import("../scripts/leaguepedia/http");

    const promise = fetchLeaguepediaJson<{ ok: boolean }>({ action: "test" });
    // Drain retry backoff timers as they're scheduled.
    for (let i = 0; i < 10 && calls < 3; i += 1) {
      await vi.advanceTimersByTimeAsync(65_000);
    }
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(calls).toBe(3);
  });

  it("gives up after MAX_RETRIES and does not loop forever", async () => {
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls += 1;
      return {
        status: 200,
        json: async () => ({
          error: { code: "ratelimited", info: "still limited" },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const { fetchLeaguepediaJson, LeaguepediaApiError } = await import(
      "../scripts/leaguepedia/http"
    );

    const promise = fetchLeaguepediaJson({ action: "test" }).catch((e) => e);
    for (let i = 0; i < 15; i += 1) {
      await vi.advanceTimersByTimeAsync(65_000);
    }
    const error = await promise;

    expect(error).toBeInstanceOf(LeaguepediaApiError);
    // Bounded: a fixed, small number of attempts, not unbounded retry.
    expect(calls).toBeLessThanOrEqual(6);
    expect(calls).toBeGreaterThan(1);
  });

  it("does not retry a non-retryable API error", async () => {
    let calls = 0;
    global.fetch = vi.fn(async () => {
      calls += 1;
      return {
        status: 200,
        json: async () => ({
          error: { code: "invalidtitle", info: "bad title" },
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const { fetchLeaguepediaJson } = await import("../scripts/leaguepedia/http");

    await expect(fetchLeaguepediaJson({ action: "test" })).rejects.toThrow("bad title");
    expect(calls).toBe(1);
  });
});
