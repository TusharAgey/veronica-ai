import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarToggle } from "../../../components/side-bar/SidebarToggle";

describe("SidebarToggle", () => {
  it("shows ChevronRight when collapsed", () => {
    render(<SidebarToggle isCollapsed={true} onToggle={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows ChevronLeft when expanded", () => {
    render(<SidebarToggle isCollapsed={false} onToggle={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const onToggle = vi.fn();
    render(<SidebarToggle isCollapsed={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
