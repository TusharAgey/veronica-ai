import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "../../components/Settings";

describe("Settings", () => {
  it("returns null when isOpen is false", () => {
    const { container } = render(
      <Settings
        isOpen={false}
        onClose={() => {}}
        theme="dark"
        setTheme={() => {}}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders when isOpen is true", () => {
    render(
      <Settings
        isOpen={true}
        onClose={() => {}}
        theme="dark"
        setTheme={() => {}}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("shows theme toggle buttons", () => {
    render(
      <Settings
        isOpen={true}
        onClose={() => {}}
        theme="dark"
        setTheme={() => {}}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    expect(screen.getByText("Studio")).toBeInTheDocument();
    expect(screen.getByText("Obsidian")).toBeInTheDocument();
  });

  it("calls setTheme when Studio is clicked", () => {
    const setTheme = vi.fn();
    render(
      <Settings
        isOpen={true}
        onClose={() => {}}
        theme="midnight"
        setTheme={setTheme}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Studio"));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme when Obsidian is clicked", () => {
    const setTheme = vi.fn();
    render(
      <Settings
        isOpen={true}
        onClose={() => {}}
        theme="dark"
        setTheme={setTheme}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Obsidian"));
    expect(setTheme).toHaveBeenCalledWith("midnight");
  });

  it("shows blur slider with current value", () => {
    render(
      <Settings
        isOpen={true}
        onClose={() => {}}
        theme="dark"
        setTheme={() => {}}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    expect(screen.getByText("10px")).toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Settings
        isOpen={true}
        onClose={onClose}
        theme="dark"
        setTheme={() => {}}
        blurValue={10}
        setBlurValue={() => {}}
      />,
    );
    // The backdrop is the first div with fixed inset-0
    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
