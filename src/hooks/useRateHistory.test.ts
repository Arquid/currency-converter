import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRateHistory } from "./useRateHistory";
import { fetchExchangeRateHistory } from "../utils/api";
import type { RateHistoryPoint } from "../types";

vi.mock("../utils/api", () => ({
  fetchExchangeRateHistory: vi.fn(),
}));

const mockedFetchExchangeRateHistory = vi.mocked(fetchExchangeRateHistory);

describe("useRateHistory", () => {
  beforeEach(() => {
    mockedFetchExchangeRateHistory.mockReset();
  });

  it("starts in a loading state and then returns the fetched points", async () => {
    const points: RateHistoryPoint[] = [
      { date: "2026-06-18", rate: 1.1 },
      { date: "2026-07-17", rate: 1.15 },
    ];
    mockedFetchExchangeRateHistory.mockResolvedValueOnce(points);

    const { result } = renderHook(() => useRateHistory("EUR", "USD"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.points).toEqual(points);
  });

  it("resets to loading and drops the old points when the currency pair changes (regression: stale history under a new pair)", async () => {
    let resolveFirst!: (points: RateHistoryPoint[]) => void;
    let resolveSecond!: (points: RateHistoryPoint[]) => void;

    mockedFetchExchangeRateHistory
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    const { result, rerender } = renderHook(
      ({ from, to }) => useRateHistory(from, to),
      { initialProps: { from: "EUR", to: "USD" } }
    );

    const usdPoints: RateHistoryPoint[] = [
      { date: "2026-06-18", rate: 1.1 },
      { date: "2026-07-17", rate: 1.15 },
    ];
    await act(async () => resolveFirst(usdPoints));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.points).toEqual(usdPoints);

    // Switch to a different currency pair while a slow fetch is in flight.
    rerender({ from: "EUR", to: "GBP" });

    // The EUR/USD history must not still be shown as if it were the EUR/GBP history.
    expect(result.current.status).toBe("loading");
    expect(result.current.points).toEqual([]);

    const gbpPoints: RateHistoryPoint[] = [
      { date: "2026-06-18", rate: 0.85 },
      { date: "2026-07-17", rate: 0.86 },
    ];
    await act(async () => resolveSecond(gbpPoints));
    await waitFor(() => expect(result.current.points).toEqual(gbpPoints));
  });

  it("surfaces an error state when the fetch fails", async () => {
    mockedFetchExchangeRateHistory.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useRateHistory("EUR", "USD"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.points).toEqual([]);
  });
});
