import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useExchangeRate } from "./useExchangeRate";
import { fetchExchangeRate } from "../utils/api";

vi.mock("../utils/api", () => ({
  fetchExchangeRate: vi.fn(),
}));

const mockedFetchExchangeRate = vi.mocked(fetchExchangeRate);

describe("useExchangeRate", () => {
  beforeEach(() => {
    mockedFetchExchangeRate.mockReset();
  });

  it("does not keep showing the old rate under a new currency pair while the new pair loads (regression: stale rate shown under wrong currency)", async () => {
    let resolveFirst!: (rate: number) => void;
    let resolveSecond!: (rate: number) => void;

    mockedFetchExchangeRate
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    const { result, rerender } = renderHook(
      ({ from, to }) => useExchangeRate(from, to),
      { initialProps: { from: "EUR", to: "USD" } }
    );

    await act(async () => resolveFirst(1.1448));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.rate).toBe(1.1448);

    // Switch to a different currency pair while a slow fetch is in flight.
    rerender({ from: "EUR", to: "GBP" });

    // The EUR/USD rate must not be shown as if it were the EUR/GBP rate.
    expect(result.current.rate).toBeNull();
    expect(result.current.status).toBe("loading");

    await act(async () => resolveSecond(0.8572));
    await waitFor(() => expect(result.current.rate).toBe(0.8572));
  });

  it("keeps the previous rate visible, flagged as refreshing, when refetching the same pair (regression: refresh flicker)", async () => {
    let resolveFirst!: (rate: number) => void;
    let resolveSecond!: (rate: number) => void;

    mockedFetchExchangeRate
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    const { result } = renderHook(() => useExchangeRate("EUR", "USD"));

    await act(async () => resolveFirst(1.1448));
    await waitFor(() => expect(result.current.status).toBe("success"));

    act(() => result.current.refresh());

    expect(result.current.rate).toBe(1.1448);
    expect(result.current.status).toBe("success");
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => resolveSecond(1.15));
    await waitFor(() => expect(result.current.rate).toBe(1.15));
    expect(result.current.isRefreshing).toBe(false);
  });

  it("surfaces an error message when the fetch fails", async () => {
    mockedFetchExchangeRate.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useExchangeRate("EUR", "USD"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom");
    expect(result.current.rate).toBeNull();
  });
});
