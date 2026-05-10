import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Journal from "../../components/Journal";

// Mock framer-motion for MagicCard
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useMotionTemplate: (fn: any) => fn,
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
  }),
}));

describe("Journal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders textarea with placeholder", () => {
    render(<Journal />);
    expect(
      screen.getByPlaceholderText("What's on your mind today?"),
    ).toBeInTheDocument();
  });

  it("submit button is disabled when content is empty", () => {
    render(<Journal />);
    const submitButton = screen.getByText("Submit Entry").closest("button");
    expect(submitButton).toBeDisabled();
  });

  it("shows 'Saving...' state on submit", () => {
    render(<Journal />);
    const textarea = screen.getByPlaceholderText("What's on your mind today?");
    fireEvent.change(textarea, { target: { value: "My journal entry" } });

    const submitButton = screen.getByText("Submit Entry");
    fireEvent.click(submitButton);

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("shows 'Saved!' state after simulated save completes", () => {
    render(<Journal />);
    const textarea = screen.getByPlaceholderText("What's on your mind today?");
    fireEvent.change(textarea, { target: { value: "My entry" } });

    fireEvent.click(screen.getByText("Submit Entry"));

    // Fast-forward past the 800ms save simulation
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("returns to 'Submit Entry' after save + 2 second delay", () => {
    render(<Journal />);
    const textarea = screen.getByPlaceholderText("What's on your mind today?");
    fireEvent.change(textarea, { target: { value: "My entry" } });

    fireEvent.click(screen.getByText("Submit Entry"));

    // Fast-forward past save (800ms) + display (2000ms)
    act(() => {
      vi.advanceTimersByTime(2800);
    });

    expect(screen.getByText("Submit Entry")).toBeInTheDocument();
  });
});
