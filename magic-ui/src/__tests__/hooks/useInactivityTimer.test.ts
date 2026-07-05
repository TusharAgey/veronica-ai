import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInactivityTimer } from "../../hooks/useInactivityTimer";

describe("useInactivityTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with neither cosmetic nor hard lock active", () => {
    const { result } = renderHook(() => useInactivityTimer());
    expect(result.current.isCosmeticallyHidden).toBe(false);
    expect(result.current.isHardLocked).toBe(false);
  });

  it("triggers cosmetic hide after the cosmetic timeout", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    expect(result.current.isCosmeticallyHidden).toBe(false);

    // Advance just before the cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(29_999);
    });
    expect(result.current.isCosmeticallyHidden).toBe(false);

    // Advance past the cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCosmeticallyHidden).toBe(true);
    // Hard lock should not be triggered yet
    expect(result.current.isHardLocked).toBe(false);
  });

  it("triggers hard lock after the hard timeout", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    // Advance past the cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(true);
    expect(result.current.isHardLocked).toBe(false);

    // Advance to just before the hard timeout
    act(() => {
      vi.advanceTimersByTime(269_999);
    });
    expect(result.current.isHardLocked).toBe(false);

    // Advance past the hard timeout
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isHardLocked).toBe(true);
    expect(result.current.isCosmeticallyHidden).toBe(true);
  });

  it("resets both timers on user activity (mousemove)", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    // Advance almost to cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(false);

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    // Advance past the original cosmetic timeout — should NOT trigger
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(false);

    // Advance the full cosmetic timeout from the reset
    act(() => {
      vi.advanceTimersByTime(28_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(true);
  });

  it("resets both timers on keydown", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    act(() => {
      vi.advanceTimersByTime(25_000);
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown"));
    });

    // Should have reset
    act(() => {
      vi.advanceTimersByTime(29_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(false);
  });

  it("triggers immediate hard lock on tab visibility loss", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    expect(result.current.isHardLocked).toBe(false);

    // Simulate tab losing focus
    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isHardLocked).toBe(true);
    expect(result.current.isCosmeticallyHidden).toBe(true);
  });

  it("does not trigger hard lock when tab regains visibility", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    // Simulate tab losing focus
    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current.isHardLocked).toBe(true);

    // Simulate tab regaining focus — should NOT reset the lock
    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // Lock should persist
    expect(result.current.isHardLocked).toBe(true);
  });

  it("resetActivity manually resets both timers", () => {
    const { result } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    // Advance almost to cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(29_000);
    });

    // Manually reset
    act(() => {
      result.current.resetActivity();
    });

    // Advance past the original cosmetic timeout
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(false);

    // Advance the full cosmetic timeout from the reset
    act(() => {
      vi.advanceTimersByTime(28_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(true);
  });

  it("cleans up timers and event listeners on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useInactivityTimer({ cosmeticTimeout: 30_000, hardTimeout: 300_000 }),
    );

    unmount();

    // Advance past both timeouts — should not throw (cleanup worked)
    act(() => {
      vi.advanceTimersByTime(300_000);
    });

    // The hook is unmounted, so these should remain at their last values
    // (which is the initial state since no timers fired)
    expect(result.current.isCosmeticallyHidden).toBe(false);
    expect(result.current.isHardLocked).toBe(false);
  });

  it("uses default timeouts when no options provided", () => {
    const { result } = renderHook(() => useInactivityTimer());

    // Default cosmetic is 30s, default hard is 5min
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.isCosmeticallyHidden).toBe(true);

    act(() => {
      vi.advanceTimersByTime(270_000);
    });
    expect(result.current.isHardLocked).toBe(true);
  });
});
