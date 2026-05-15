import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarNavItem } from "../../../components/side-bar/SidebarNavItem";

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

describe("SidebarNavItem", () => {
  it("renders the label text", () => {
    render(
      <SidebarNavItem
        icon={<span>🔍</span>}
        label="Dashboard"
        isActive={false}
        onClick={() => {}}
        isCollapsed={false}
      />,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the icon", () => {
    render(
      <SidebarNavItem
        icon={<span data-testid="icon">🔍</span>}
        label="Dashboard"
        isActive={false}
        onClick={() => {}}
        isCollapsed={false}
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <SidebarNavItem
        icon={<span>🔍</span>}
        label="Dashboard"
        isActive={false}
        onClick={onClick}
        isCollapsed={false}
      />,
    );
    fireEvent.click(screen.getByText("Dashboard"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("hides label text when collapsed", () => {
    render(
      <SidebarNavItem
        icon={<span>🔍</span>}
        label="Dashboard"
        isActive={false}
        onClick={() => {}}
        isCollapsed={true}
      />,
    );
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
