import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error("boom");
  return <p>all good</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React logs every error it catches, which would only add noise to the test output.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders its children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("all good")).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  });

  it("shows a fallback message instead of the crashed tree when a child throws while rendering", () => {
    render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
    expect(screen.queryByText("all good")).not.toBeInTheDocument();
  });

  it("offers a Reload button in the fallback", () => {
    render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );

    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("reloads the page when Reload is clicked", () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
