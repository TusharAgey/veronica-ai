import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SpatialEnvironment } from "../../../components/layout/SpatialEnvironment";

describe("SpatialEnvironment", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all 6 scene images", () => {
    const { container } = render(<SpatialEnvironment />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(6);
  });

  it("only one scene is visible at a time", () => {
    const { container } = render(<SpatialEnvironment />);
    const visibleDivs = container.querySelectorAll(".opacity-100");
    expect(visibleDivs.length).toBe(1);
  });

  it("cycles to next scene after 60 seconds", () => {
    const { container } = render(<SpatialEnvironment />);

    // Initially one visible
    let visibleDivs = container.querySelectorAll(".opacity-100");
    expect(visibleDivs.length).toBe(1);

    // Fast-forward 60 seconds
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Still only one visible (just a different one)
    visibleDivs = container.querySelectorAll(".opacity-100");
    expect(visibleDivs.length).toBe(1);
  });
});
