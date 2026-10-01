import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("./hooks/useExchangeRate", () => ({
  useExchangeRate: () => ({
    rate: 1.1,
    status: "success",
    error: null,
    updatedAt: "12:00:00",
    isRefreshing: false,
    refresh: vi.fn(),
  }),
}));

vi.mock("./hooks/useRateHistory", () => ({
  useRateHistory: () => ({ points: [], status: "success" }),
}));

describe("App URL sync", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("falls back to the defaults when the URL has no query params", async () => {
    window.history.replaceState(null, "", "/");

    const { default: App } = await import("./App");
    const { container } = render(<App />);

    expect(screen.getByLabelText("Amount")).toHaveValue("100");
    const selects = container.querySelectorAll("select");
    expect(selects[0]).toHaveValue("EUR");
    expect(selects[1]).toHaveValue("USD");
  });

  it("initializes amount, from, and to from a shared URL (regression: deep link not applied)", async () => {
    window.history.replaceState(null, "", "/?amount=250,5&from=USD&to=JPY");

    const { default: App } = await import("./App");
    const { container } = render(<App />);

    expect(screen.getByLabelText("Amount")).toHaveValue("250,5");
    const selects = container.querySelectorAll("select");
    expect(selects[0]).toHaveValue("USD");
    expect(selects[1]).toHaveValue("JPY");
  });

  it("ignores invalid query params and falls back to the defaults", async () => {
    window.history.replaceState(null, "", "/?amount=not-a-number&from=XXX&to=YYY");

    const { default: App } = await import("./App");
    const { container } = render(<App />);

    expect(screen.getByLabelText("Amount")).toHaveValue("100");
    const selects = container.querySelectorAll("select");
    expect(selects[0]).toHaveValue("EUR");
    expect(selects[1]).toHaveValue("USD");
  });

  it("keeps the URL in sync after the user changes a currency", async () => {
    window.history.replaceState(null, "", "/?amount=100&from=EUR&to=USD");

    const { default: App } = await import("./App");
    const { container } = render(<App />);

    const toSelect = container.querySelectorAll("select")[1] as HTMLSelectElement;
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")!.set!;
    nativeSetter.call(toSelect, "GBP");
    toSelect.dispatchEvent(new Event("change", { bubbles: true }));

    await vi.waitFor(() => {
      expect(new URLSearchParams(window.location.search).get("to")).toBe("GBP");
    });
  });
});

describe("App amount input", () => {
  beforeEach(() => {
    vi.resetModules();
    window.history.replaceState(null, "", "/");
  });

  async function renderApp() {
    const { default: App } = await import("./App");
    render(<App />);
    return screen.getByLabelText("Amount");
  }

  it("reads a space as a thousands separator instead of silently converting 1 (regression)", async () => {
    const amount = await renderApp();

    fireEvent.change(amount, { target: { value: "1 000" } });

    expect(screen.queryByText("Please enter a valid number.")).not.toBeInTheDocument();
    expect(screen.getByText(/1 000,00/)).toBeInTheDocument();
  });

  it("shows the error and no conversion for a negative amount (regression: the result was still shown)", async () => {
    const amount = await renderApp();

    fireEvent.change(amount, { target: { value: "-5" } });

    expect(screen.getByText("Please enter a valid number.")).toBeInTheDocument();
    expect(screen.getByText("Enter the amount for conversion")).toBeInTheDocument();
    expect(screen.queryByText(/[−-]5,/)).not.toBeInTheDocument();
  });

  it("rejects an ambiguous grouped number rather than guessing", async () => {
    const amount = await renderApp();

    fireEvent.change(amount, { target: { value: "1,000.50" } });

    expect(screen.getByText("Please enter a valid number.")).toBeInTheDocument();
    expect(screen.getByText("Enter the amount for conversion")).toBeInTheDocument();
  });

  it("does not show the error while the field is empty", async () => {
    const amount = await renderApp();

    fireEvent.change(amount, { target: { value: "" } });

    expect(screen.queryByText("Please enter a valid number.")).not.toBeInTheDocument();
    expect(screen.getByText("Enter the amount for conversion")).toBeInTheDocument();
  });
});
