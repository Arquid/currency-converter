import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ConversionResult } from "./ConversionResult";
import { getCurrency } from "../utils/currencies";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof ConversionResult>;

const eur = getCurrency("EUR");
const usd = getCurrency("USD");

function baseProps(overrides: Partial<Props> = {}): Props {
  return {
    state: { rate: 1.1, status: "success", error: null, updatedAt: "12:00:00" },
    isRefreshing: false,
    amount: 100,
    from: eur,
    to: usd,
    onRefresh: vi.fn(),
    history: [],
    ...overrides,
  };
}

describe("ConversionResult", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("visible result", () => {
    it("shows both amounts, the rate and the update time on success", () => {
      render(<ConversionResult {...baseProps()} />);

      expect(screen.getByText(/100,00/, { selector: ".result-from" })).toBeInTheDocument();
      expect(screen.getByText(/110,00/, { selector: ".result-to" })).toBeInTheDocument();
      expect(screen.getByText("1 EUR = 1.1000 USD", { selector: ".result-rate" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /12:00:00/ })).toBeEnabled();
    });

    it("dims the result and disables the refresh button while refreshing", () => {
      const { container } = render(<ConversionResult {...baseProps({ isRefreshing: true })} />);

      expect(container.querySelector(".result-box--refreshing")).not.toBeNull();
      expect(screen.getByRole("button", { name: /Updating/ })).toBeDisabled();
    });

    it("shows the loading message while the rate is being fetched", () => {
      render(
        <ConversionResult
          {...baseProps({ state: { rate: null, status: "loading", error: null, updatedAt: null } })}
        />
      );

      expect(screen.getByText("Fetching currency...")).toBeInTheDocument();
    });

    it("shows the error and a Try again button that calls onRefresh", () => {
      const onRefresh = vi.fn();
      render(
        <ConversionResult
          {...baseProps({
            onRefresh,
            state: { rate: null, status: "error", error: "Could not connect.", updatedAt: null },
          })}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Try again" }));

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("asks for an amount when there is no number to convert", () => {
      render(<ConversionResult {...baseProps({ amount: NaN })} />);

      expect(screen.getAllByText("Enter the amount for conversion").length).toBeGreaterThan(0);
    });
  });

  describe("screen reader announcements", () => {
    it("announces the conversion as one sentence in a polite status region", () => {
      render(<ConversionResult {...baseProps()} />);

      const status = screen.getByRole("status");

      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveAttribute("aria-atomic", "true");
      expect(status).toHaveTextContent("100,00 € is 110,00 $. Rate: 1 EUR = 1.1000 USD.");
    });

    it("waits for the value to settle before announcing a new result", () => {
      const props = baseProps();
      const { rerender } = render(<ConversionResult {...props} />);

      rerender(<ConversionResult {...props} amount={1000} />);
      expect(screen.getByRole("status")).toHaveTextContent("100,00 € is 110,00 $");

      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(screen.getByRole("status")).toHaveTextContent("1 000,00 € is 1 100,00 $");
    });

    it("announces only the last value when the amount changes on every keystroke", () => {
      const props = baseProps();
      const { rerender } = render(<ConversionResult {...props} />);

      for (const amount of [1, 10, 100, 1000]) {
        rerender(<ConversionResult {...props} amount={amount} />);
        act(() => {
          vi.advanceTimersByTime(200);
        });
      }
      expect(screen.getByRole("status")).toHaveTextContent("100,00 € is 110,00 $");

      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(screen.getByRole("status")).toHaveTextContent("1 000,00 € is 1 100,00 $");
    });

    it("announces the error with role=alert and does not repeat it in the status region", () => {
      render(
        <ConversionResult
          {...baseProps({
            state: { rate: null, status: "error", error: "Could not connect.", updatedAt: null },
          })}
        />
      );
      act(() => {
        vi.advanceTimersByTime(700);
      });

      const alert = screen.getByRole("alert");

      expect(alert).toHaveTextContent("Could not connect.");
      expect(alert).not.toHaveTextContent("Try again");
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
  });
});
