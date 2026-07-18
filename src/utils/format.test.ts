import { describe, it, expect } from "vitest";
import { formatCurrency, parseAmount, isValidAmount } from "./format";

describe("formatCurrency", () => {
  it("does not throw for JPY (regression: minimumFractionDigits used to exceed maximumFractionDigits)", () => {
    expect(() => formatCurrency(18448, "JPY")).not.toThrow();
  });

  it("formats JPY without a decimal part", () => {
    expect(formatCurrency(184.48, "JPY")).not.toMatch(/,\d/);
  });

  it("formats non-JPY currencies with a comma decimal separator (fi-FI locale)", () => {
    expect(formatCurrency(114.48, "USD")).toContain("114,48");
  });
});

describe("parseAmount", () => {
  it("parses a comma as the decimal separator", () => {
    expect(parseAmount("12,5")).toBe(12.5);
  });

  it("parses a dot as the decimal separator", () => {
    expect(parseAmount("12.5")).toBe(12.5);
  });
});

describe("isValidAmount", () => {
  it("accepts an empty string", () => {
    expect(isValidAmount("")).toBe(true);
  });

  it("rejects non-numeric input", () => {
    expect(isValidAmount("abc")).toBe(false);
  });

  it("rejects negative numbers", () => {
    expect(isValidAmount("-5")).toBe(false);
  });

  it("accepts positive numbers written with a comma", () => {
    expect(isValidAmount("12,5")).toBe(true);
  });
});
