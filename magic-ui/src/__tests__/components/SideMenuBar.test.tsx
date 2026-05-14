import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SideMenuBar from "../../components/SideMenuBar";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    nav: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <nav {...props}>{children}</nav>,
    div: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <div {...props}>{children}</div>,
    button: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <button {...props}>{children}</button>,
    aside: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <aside {...props}>{children}</aside>,
    span: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("SideMenuBar", () => {
  it("renders all 5 nav items", () => {
    render(
      <SideMenuBar
        activeTab="dashboard"
        setActiveTab={() => {}}
        isCollapsed={false}
        setIsCollapsed={() => {}}
        blurValue={10}
      />,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Passwords")).toBeInTheDocument();
    expect(screen.getByText("Journal")).toBeInTheDocument();
    expect(screen.getByText("Chatbot")).toBeInTheDocument();
    expect(screen.getByText("Hologram")).toBeInTheDocument();
  });

  it("calls setActiveTab when a nav item is clicked", () => {
    const setActiveTab = vi.fn();
    render(
      <SideMenuBar
        activeTab="dashboard"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        setIsCollapsed={() => {}}
        blurValue={10}
      />,
    );
    fireEvent.click(screen.getByText("Passwords"));
    expect(setActiveTab).toHaveBeenCalledWith("passwords");
  });
});
