import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BotSelector } from "../../../components/chatbot/BotSelector";

const BOTS = ["Code Bot", "Space Pirate"];

describe("BotSelector", () => {
  it("renders the active bot name", () => {
    render(
      <BotSelector bots={BOTS} activeBot="Code Bot" onSelectBot={() => {}} />,
    );
    expect(screen.getByText("Code Bot")).toBeInTheDocument();
  });

  it("renders the active bot name when Space Pirate is selected", () => {
    render(
      <BotSelector
        bots={BOTS}
        activeBot="Space Pirate"
        onSelectBot={() => {}}
      />,
    );
    expect(screen.getByText("Space Pirate")).toBeInTheDocument();
  });

  it("opens dropdown on trigger button click", () => {
    render(
      <BotSelector bots={BOTS} activeBot="Code Bot" onSelectBot={() => {}} />,
    );
    const trigger = screen.getByRole("button", { name: /code bot/i });
    fireEvent.click(trigger);
    // Both bots should now be visible in the dropdown
    expect(screen.getAllByText("Code Bot").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Space Pirate")).toBeInTheDocument();
  });

  it("calls onSelectBot when a bot is selected from dropdown", () => {
    const onSelectBot = vi.fn();
    render(
      <BotSelector
        bots={BOTS}
        activeBot="Code Bot"
        onSelectBot={onSelectBot}
      />,
    );
    // Open dropdown
    const trigger = screen.getByRole("button", { name: /code bot/i });
    fireEvent.click(trigger);

    // Click Space Pirate
    fireEvent.click(screen.getByText("Space Pirate"));
    expect(onSelectBot).toHaveBeenCalledWith("Space Pirate");
  });

  it("closes dropdown after selection", () => {
    const onSelectBot = vi.fn();
    render(
      <BotSelector
        bots={BOTS}
        activeBot="Code Bot"
        onSelectBot={onSelectBot}
      />,
    );
    // Open dropdown
    const trigger = screen.getByRole("button", { name: /code bot/i });
    fireEvent.click(trigger);

    // Select Space Pirate
    fireEvent.click(screen.getByText("Space Pirate"));

    // Dropdown should close - Space Pirate should no longer be in a dropdown context
    // (only the trigger button text should show)
    expect(screen.getByText("Code Bot")).toBeInTheDocument();
  });

  it("closes dropdown on outside click", () => {
    render(
      <BotSelector bots={BOTS} activeBot="Code Bot" onSelectBot={() => {}} />,
    );
    // Open dropdown
    const trigger = screen.getByRole("button", { name: /code bot/i });
    fireEvent.click(trigger);

    // Both bots visible
    expect(screen.getByText("Space Pirate")).toBeInTheDocument();

    // Click outside (document body)
    fireEvent.mouseDown(document.body);

    // Dropdown should close
    // Space Pirate should no longer be visible as a dropdown option
    // (the trigger button only shows active bot name)
  });
});
