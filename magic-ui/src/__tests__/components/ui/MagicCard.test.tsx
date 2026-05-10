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
});
