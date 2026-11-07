import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { fetchExchangeRate, fetchExchangeRateHistory } from "./api";

// fetch is now called with a second argument that carries the abort signal.
const withSignal = expect.objectContaining({ signal: expect.any(AbortSignal) });

describe("fetchExchangeRate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 1 without calling fetch when converting a currency to itself", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const rate = await fetchExchangeRate("EUR", "EUR");

    expect(rate).toBe(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws a user-friendly message on a server error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response)
    );

    await expect(fetchExchangeRate("EUR", "USD")).rejects.toThrow(/currently unavailable/i);
  });

  it("throws a user-friendly message on a client error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response)
    );

    await expect(fetchExchangeRate("EUR", "USD")).rejects.toThrow(/could not fetch/i);
  });

  it("throws a user-friendly message when the network request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchExchangeRate("EUR", "USD")).rejects.toThrow(/check your internet connection/i);
  });

  it("throws when the target currency is missing from the response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ amount: 1, base: "EUR", date: "2026-01-01", rates: {} }),
      } as Response)
    );

    await expect(fetchExchangeRate("EUR", "USD")).rejects.toThrow(/not available/i);
  });
});

describe("fetchExchangeRateHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty array without calling fetch when converting a currency to itself", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const points = await fetchExchangeRateHistory("EUR", "EUR");

    expect(points).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requests a date range and returns the points sorted by date", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        amount: 1,
        base: "EUR",
        start_date: "2026-06-18",
        end_date: "2026-07-17",
        rates: {
          "2026-07-01": { USD: 1.12 },
          "2026-06-20": { USD: 1.1 },
        },
      }),
    } as Response);
    vi.stubGlobal("fetch", fetchSpy);

    const points = await fetchExchangeRateHistory("EUR", "USD");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\/api\/\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}\?from=EUR&to=USD$/),
      withSignal
    );
    expect(points).toEqual([
      { date: "2026-06-20", rate: 1.1 },
      { date: "2026-07-01", rate: 1.12 },
    ]);
  });

  it("skips dates that are missing the target currency", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          amount: 1,
          base: "EUR",
          start_date: "2026-06-18",
          end_date: "2026-07-17",
          rates: {
            "2026-06-20": { GBP: 0.85 },
            "2026-06-21": { USD: 1.1 },
          },
        }),
      } as Response)
    );

    const points = await fetchExchangeRateHistory("EUR", "USD");

    expect(points).toEqual([{ date: "2026-06-21", rate: 1.1 }]);
  });

  it("throws a user-friendly message on a server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 } as Response));

    await expect(fetchExchangeRateHistory("EUR", "USD")).rejects.toThrow(/currently unavailable/i);
  });

  it("throws a user-friendly message when the network request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchExchangeRateHistory("EUR", "USD")).rejects.toThrow(/check your internet connection/i);
  });
});

describe("API base URL", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function stubFetch(body: unknown) {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => body } as Response);
    vi.stubGlobal("fetch", fetchSpy);
    return fetchSpy;
  }

  const latestBody = { amount: 1, base: "EUR", date: "2026-01-01", rates: { USD: 1.1 } };

  it("uses the /api proxy path when VITE_API_BASE_URL is empty", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");
    const fetchSpy = stubFetch(latestBody);
    const { fetchExchangeRate } = await import("./api");

    await fetchExchangeRate("EUR", "USD");

    expect(fetchSpy).toHaveBeenCalledWith("/api/latest?from=EUR&to=USD", withSignal);
  });

  it("uses VITE_API_BASE_URL when it is set", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.frankfurter.dev/v1");
    const fetchSpy = stubFetch(latestBody);
    const { fetchExchangeRate } = await import("./api");

    await fetchExchangeRate("EUR", "USD");

    expect(fetchSpy).toHaveBeenCalledWith("https://api.frankfurter.dev/v1/latest?from=EUR&to=USD", withSignal);
  });

  it("ignores trailing slashes in VITE_API_BASE_URL instead of producing a double slash", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.frankfurter.dev/v1/");
    const fetchSpy = stubFetch(latestBody);
    const { fetchExchangeRate } = await import("./api");

    await fetchExchangeRate("EUR", "USD");

    expect(fetchSpy).toHaveBeenCalledWith("https://api.frankfurter.dev/v1/latest?from=EUR&to=USD", withSignal);
  });

  it("uses VITE_API_BASE_URL for the rate history request too", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.frankfurter.dev/v1");
    const fetchSpy = stubFetch({
      amount: 1,
      base: "EUR",
      start_date: "2026-01-01",
      end_date: "2026-01-02",
      rates: { "2026-01-01": { USD: 1.1 } },
    });
    const { fetchExchangeRateHistory } = await import("./api");

    await fetchExchangeRateHistory("EUR", "USD");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/api\.frankfurter\.dev\/v1\/\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}\?from=EUR&to=USD$/),
      withSignal
    );
  });
});

describe("request timeout and cancellation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // A fetch that never answers but rejects when its signal is aborted (also when
  // the signal is already aborted at the time of the call), like the real one.
  function stubHangingFetch() {
    const fetchSpy = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const abort = () => reject(new DOMException("The operation was aborted.", "AbortError"));
          if (init?.signal?.aborted) abort();
          init?.signal?.addEventListener("abort", abort);
        })
    );
    vi.stubGlobal("fetch", fetchSpy);
    return fetchSpy;
  }

  it("gives up with a friendly message when the API does not answer in 10 seconds", async () => {
    stubHangingFetch();

    const assertion = expect(fetchExchangeRate("EUR", "USD")).rejects.toThrow(/did not respond in time/i);
    await vi.advanceTimersByTimeAsync(10_000);

    await assertion;
  });

  it("does not give up before the 10 seconds are over", async () => {
    stubHangingFetch();
    let settled = false;
    const pending = fetchExchangeRate("EUR", "USD")
      .catch(() => {})
      .finally(() => {
        settled = true;
      });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(settled).toBe(true);
  });

  it("times out the rate history request too", async () => {
    stubHangingFetch();

    const assertion = expect(fetchExchangeRateHistory("EUR", "USD")).rejects.toThrow(/did not respond in time/i);
    await vi.advanceTimersByTimeAsync(10_000);

    await assertion;
  });

  it("rejects with the original AbortError, not a user-facing message, when the caller cancels", async () => {
    stubHangingFetch();
    const controller = new AbortController();

    const assertion = expect(
      fetchExchangeRate("EUR", "USD", { signal: controller.signal })
    ).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();

    await assertion;
  });

  it("rejects straight away when the signal is already aborted", async () => {
    const fetchSpy = stubHangingFetch();
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchExchangeRateHistory("EUR", "USD", { signal: controller.signal })
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("clears its timer when the response arrives, so nothing fires later", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ amount: 1, base: "EUR", date: "2026-01-01", rates: { USD: 1.1 } }),
      } as Response)
    );

    await fetchExchangeRate("EUR", "USD");

    expect(vi.getTimerCount()).toBe(0);
  });
});
