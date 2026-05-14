import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MagicCard } from "../../../components/ui/MagicCard";

// Mock framer-motion
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

describe("MagicCard", () => {
  it("renders children inside the card", () => {
    render(<MagicCard>Hello World</MagicCard>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MagicCard className="custom-class">Content</MagicCard>,
    );
    const card = container.firstElementChild;
    expect(card?.className).toContain("custom-class");
  });

  it("renders complex children", () => {
    render(
      <MagicCard>
        <div data-testid="child">Nested</div>
      </MagicCard>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("handles mouse enter event", () => {
    render(<MagicCard>Hover me</MagicCard>);
    const card = screen.getByText("Hover me").closest("div");
    fireEvent.mouseEnter(card!);
    // No crash - hover state is set internally
  });

  it("handles mouse leave event", () => {
    render(<MagicCard>Leave me</MagicCard>);
    const card = screen.getByText("Leave me").closest("div");
    fireEvent.mouseEnter(card!);
    fireEvent.mouseLeave(card!);
    // No crash - hover state is cleared internally
  });

  it("handles mouse move event", () => {
    render(<MagicCard>Move over me</MagicCard>);
    const card = screen.getByText("Move over me").closest("div");
    // Mock getBoundingClientRect
    Object.defineProperty(card!, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, right: 100, bottom: 100 }),
    });
    fireEvent.mouseMove(card!, { clientX: 50, clientY: 50 });
    // No crash - mouse position is tracked internally
  });

  it("passes additional props to the container div", () => {
    render(<MagicCard data-testid="magic-card">Props</MagicCard>);
    expect(screen.getByTestId("magic-card")).toBeInTheDocument();
  });

  it("applies default gradient classes", () => {
    const { container } = render(<MagicCard>Gradient</MagicCard>);
    const card = container.firstElementChild;
    expect(card?.className).toContain("rounded-[2rem]");
    expect(card?.className).toContain("overflow-hidden");
  });
});
