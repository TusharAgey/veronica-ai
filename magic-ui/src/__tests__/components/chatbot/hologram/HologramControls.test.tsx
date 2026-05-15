import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HologramControls } from "../../../../components/chatbot/hologram/HologramControls";

describe("HologramControls", () => {
  it("renders toggle and close buttons", () => {
    render(
      <HologramControls
        singleOrbMode={false}
        toggleSingleOrb={() => {}}
        closeModal={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(2);
  });

  it("shows 'Switch to single-orb mode' title when singleOrbMode is false", () => {
    render(
      <HologramControls
        singleOrbMode={false}
        toggleSingleOrb={() => {}}
        closeModal={() => {}}
      />,
    );
    expect(screen.getByTitle("Switch to single-orb mode")).toBeInTheDocument();
  });

  it("shows 'Switch to 4-orb mode' title when singleOrbMode is true", () => {
    render(
      <HologramControls
        singleOrbMode={true}
        toggleSingleOrb={() => {}}
        closeModal={() => {}}
      />,
    );
    expect(screen.getByTitle("Switch to 4-orb mode")).toBeInTheDocument();
  });

  it("calls toggleSingleOrb when toggle button is clicked", () => {
    const toggleSingleOrb = vi.fn();
    render(
      <HologramControls
        singleOrbMode={false}
        toggleSingleOrb={toggleSingleOrb}
        closeModal={() => {}}
      />,
    );
    fireEvent.click(screen.getByTitle("Switch to single-orb mode"));
    expect(toggleSingleOrb).toHaveBeenCalledTimes(1);
  });

  it("calls closeModal when close button is clicked", () => {
    const closeModal = vi.fn();
    render(
      <HologramControls
        singleOrbMode={false}
        toggleSingleOrb={() => {}}
        closeModal={closeModal}
      />,
    );
    const buttons = screen.getAllByRole("button");
    // The close button is the second button
    fireEvent.click(buttons[1]);
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it("applies different positioning class when singleOrbMode is true", () => {
    const { container } = render(
      <HologramControls
        singleOrbMode={true}
        toggleSingleOrb={() => {}}
        closeModal={() => {}}
      />,
    );
    const outerDiv = container.firstElementChild;
    expect(outerDiv?.className).toContain("top-6");
    expect(outerDiv?.className).toContain("right-6");
  });

  it("applies different positioning class when singleOrbMode is false", () => {
    const { container } = render(
      <HologramControls
        singleOrbMode={false}
        toggleSingleOrb={() => {}}
        closeModal={() => {}}
      />,
    );
    const outerDiv = container.firstElementChild;
    expect(outerDiv?.className).toContain("left-1/2");
    expect(outerDiv?.className).toContain("top-1/2");
  });
});
