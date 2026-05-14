import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarBrand } from "../../../components/side-bar/SidebarBrand";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("SidebarBrand", () => {
  it("shows the V logo always", () => {
    render(<SidebarBrand isCollapsed={false} />);
    expect(screen.getByText("V")).toBeInTheDocument();
  });

  it("shows ASSISTANT text when not collapsed", () => {
    render(<SidebarBrand isCollapsed={false} />);
    expect(screen.getByText("ASSISTANT")).toBeInTheDocument();
  });

  it("hides ASSISTANT text when collapsed", () => {
    render(<SidebarBrand isCollapsed={true} />);
    expect(screen.queryByText("ASSISTANT")).not.toBeInTheDocument();
  });
});
