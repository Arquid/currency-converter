import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencySelect } from "./CurrencySelect";
import { CURRENCIES } from "../utils/currencies";

describe("CurrencySelect", () => {
  it("is named by its visible label (regression: the label pointed to an id the select did not have)", () => {
    render(<CurrencySelect value="EUR" onChange={() => {}} label="Starting currency" currencies={CURRENCIES} />);

    expect(screen.getByLabelText("Starting currency")).toHaveValue("EUR");
  });

  it("gives every instance its own id, so two selects are not tied to the same label", () => {
    render(
      <>
        <CurrencySelect value="EUR" onChange={() => {}} label="Starting currency" currencies={CURRENCIES} />
        <CurrencySelect value="USD" onChange={() => {}} label="Target currency" currencies={CURRENCIES} />
      </>
    );

    const from = screen.getByLabelText("Starting currency");
    const to = screen.getByLabelText("Target currency");

    expect(from.id).not.toBe("");
    expect(from.id).not.toBe(to.id);
    expect(to).toHaveValue("USD");
  });

  it("reports the chosen currency code", () => {
    const onChange = vi.fn();
    render(<CurrencySelect value="EUR" onChange={onChange} label="Starting currency" currencies={CURRENCIES} />);

    fireEvent.change(screen.getByLabelText("Starting currency"), { target: { value: "GBP" } });

    expect(onChange).toHaveBeenCalledWith("GBP");
  });
});
