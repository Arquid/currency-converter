import { describe, it, expect, vi, afterEach } from "vitest";
import { readStateFromUrl, writeStateToUrl } from "./url";

describe("readStateFromUrl", () => {
  it("returns an empty object when there are no query params", () => {
    expect(readStateFromUrl("")).toEqual({});
  });

  it("reads a valid amount, from, and to", () => {
    expect(readStateFromUrl("?amount=100&from=EUR&to=USD")).toEqual({
      amount: "100",
      from: "EUR",
      to: "USD",
    });
  });

  it("accepts a comma decimal separator in the amount", () => {
    expect(readStateFromUrl("?amount=250,5")).toEqual({ amount: "250,5" });
  });

  it("omits a non-numeric amount", () => {
    expect(readStateFromUrl("?amount=not-a-number")).toEqual({});
  });

  it("omits a negative amount", () => {
    expect(readStateFromUrl("?amount=-5")).toEqual({});
  });

  it("omits an empty amount param", () => {
    expect(readStateFromUrl("?amount=")).toEqual({});
  });

  it("omits an unknown currency code", () => {
    expect(readStateFromUrl("?from=XXX&to=YYY")).toEqual({});
  });

  it("only includes the params that were present and valid", () => {
    expect(readStateFromUrl("?from=EUR&to=NOTREAL")).toEqual({ from: "EUR" });
  });
});

describe("writeStateToUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes amount, from, and to as query params", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});

    writeStateToUrl({ amount: "100", from: "EUR", to: "USD" });

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    const [, , url] = replaceStateSpy.mock.calls[0];
    const parsed = new URL(String(url), window.location.origin);
    expect(parsed.searchParams.get("amount")).toBe("100");
    expect(parsed.searchParams.get("from")).toBe("EUR");
    expect(parsed.searchParams.get("to")).toBe("USD");
  });

  it("uses replaceState rather than pushState, so it does not add browser history entries", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    const pushStateSpy = vi.spyOn(window.history, "pushState");

    writeStateToUrl({ amount: "100", from: "EUR", to: "USD" });

    expect(replaceStateSpy).toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
  });
});
