import { describe, it, expect } from "vitest";
import { CURRENCIES, getCurrency } from "./currencies";

describe("getCurrency", () => {
  it("returns the matching currency for a known code", () => {
    expect(getCurrency("USD")?.code).toBe("USD");
  });

  it("falls back to the first currency for an unknown code instead of returning undefined", () => {
    expect(getCurrency("XXX")).toBe(CURRENCIES[0]);
  });
});
