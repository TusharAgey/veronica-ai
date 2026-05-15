import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarGlassPanel } from "../../../components/side-bar/SidebarGlassPanel";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    aside: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <aside {...props}>{children}</aside>
    ),
  },
}));

describe("SidebarGlassPanel", () => {
  it("renders children", () => {
    render(
      <SidebarGlassPanel isCollapsed={false} blurValue={5}>
        <div data-testid="child">Content</div>
      </SidebarGlassPanel>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies blurValue to backdrop-filter style", () => {
    const { container } = render(
      <SidebarGlassPanel isCollapsed={false} blurValue={10}>
        Content
      </SidebarGlassPanel>,
    );
    const aside = container.querySelector("aside");
    expect(aside?.style.backdropFilter).toContain("blur(10px)");
  });
});
