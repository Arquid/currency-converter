import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchExchangeRate, fetchExchangeRateHistory } from "./api";

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
      expect.stringMatching(/^\/api\/\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}\?from=EUR&to=USD$/)
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
