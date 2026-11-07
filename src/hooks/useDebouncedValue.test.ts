import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderDebounced(initial: string) {
    return renderHook(({ value }) => useDebouncedValue(value, 500), {
      initialProps: { value: initial },
    });
  }

  it("returns the initial value straight away", () => {
    const { result } = renderDebounced("a");

    expect(result.current).toBe("a");
  });

  it("keeps the old value until the delay has passed", () => {
    const { result, rerender } = renderDebounced("a");

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  it("restarts the wait when the value changes again, and skips the values in between", () => {
    const { result, rerender } = renderDebounced("a");

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("c");
  });

  it("does not leave a timer running after unmount", () => {
    const { rerender, unmount } = renderDebounced("a");
    rerender({ value: "b" });

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
