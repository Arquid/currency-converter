import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RateSparkline } from "./RateSparkline";
import type { RateHistoryPoint } from "../types";

function points(rates: number[]): RateHistoryPoint[] {
  return rates.map((rate, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    rate,
  }));
}

describe("RateSparkline", () => {
  it("renders nothing for zero points", () => {
    const { container } = render(<RateSparkline points={[]} fromCode="EUR" toCode="USD" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a single point", () => {
    const { container } = render(<RateSparkline points={points([1.1])} fromCode="EUR" toCode="USD" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the point count and currency pair in the title", () => {
    render(<RateSparkline points={points([1.1, 1.12, 1.15])} fromCode="EUR" toCode="USD" />);
    expect(screen.getByText("3-day EUR/USD trend")).toBeInTheDocument();
  });

  it("shows the first and last date", () => {
    render(<RateSparkline points={points([1.1, 1.12, 1.15])} fromCode="EUR" toCode="USD" />);
    expect(screen.getByText("2026-01-01 → 2026-01-03")).toBeInTheDocument();
  });

  it("uses the accent color when the rate trended up", () => {
    render(<RateSparkline points={points([1.1, 1.15])} fromCode="EUR" toCode="USD" />);
    expect(document.querySelector("polyline")).toHaveAttribute("stroke", "var(--accent)");
  });

  it("uses the danger color when the rate trended down", () => {
    render(<RateSparkline points={points([1.15, 1.1])} fromCode="EUR" toCode="USD" />);
    expect(document.querySelector("polyline")).toHaveAttribute("stroke", "var(--danger)");
  });

  it("does not produce NaN coordinates when every rate in the range is identical (regression: division by zero)", () => {
    render(<RateSparkline points={points([1.1, 1.1, 1.1])} fromCode="EUR" toCode="USD" />);
    const coords = document.querySelector("polyline")?.getAttribute("points") ?? "";
    expect(coords).not.toMatch(/NaN/);
  });
});
