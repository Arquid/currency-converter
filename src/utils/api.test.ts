import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchExchangeRate } from "./api";

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
