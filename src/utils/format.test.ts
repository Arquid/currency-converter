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

const VALID_AMOUNTS: [string, number][] = [
  ["100", 100],
  ["12,5", 12.5],
  ["12.5", 12.5],
  [".5", 0.5],
  ["5.", 5], // a separator typed on the way to "5.5"
  ["0", 0],
  ["00012", 12],
  ["1 000", 1000], // space as thousands separator (regression: was read as 1)
  ["1 000,50", 1000.5],
  [" 1000", 1000], // non-breaking space
  ["  7 ", 7],
];

const INVALID_AMOUNTS = [
  "abc",
  "12abc", // regression: was read as 12
  "abc12",
  "100%",
  "0x10",
  "1e3",
  "1_000",
  "1,2,3",
  "1,000.50", // ambiguous grouping, regression: was read as 1
  "1.000,50",
  "-5",
  "-0",
  "+5",
  "NaN",
  "Infinity",
  "1e999",
  "٣", // Arabic-Indic digit
];

describe("parseAmount", () => {
  it.each(VALID_AMOUNTS)("parses %j as %j", (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });

  it.each(INVALID_AMOUNTS)("returns NaN for %j", (raw) => {
    expect(parseAmount(raw)).toBeNaN();
  });

  it("returns NaN for an empty string", () => {
    expect(parseAmount("")).toBeNaN();
  });

  it("returns NaN when the number is too large to represent", () => {
    expect(parseAmount("9".repeat(400))).toBeNaN();
  });
});

describe("isValidAmount", () => {
  it.each(["", "   "])("accepts a blank field (%j), because nothing has been typed yet", (raw) => {
    expect(isValidAmount(raw)).toBe(true);
  });

  it.each(VALID_AMOUNTS.map(([raw]) => raw))("accepts %j", (raw) => {
    expect(isValidAmount(raw)).toBe(true);
  });

  it.each(INVALID_AMOUNTS)("rejects %j", (raw) => {
    expect(isValidAmount(raw)).toBe(false);
  });

  it("rejects a number that is too large to represent", () => {
    expect(isValidAmount("9".repeat(400))).toBe(false);
  });
});
