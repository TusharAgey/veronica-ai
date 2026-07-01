import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "../../../components/chatbot/ChatInput";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Mock the api service to prevent real HTTP calls from useGetActiveLLMModelQuery
vi.mock("../../../services/api", () => ({
  useGetActiveLLMModelQuery: () => ({
    data: { models: [{ name: "test-model" }] },
    isLoading: false,
  }),
}));

// Create a minimal store for testing - use a valid reducer to avoid warnings
function createMockStore() {
  return configureStore({
    reducer: {
      placeholder: (state = {}) => state,
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<Provider store={createMockStore()}>{ui}</Provider>);
}

describe("ChatInput", () => {
  it("renders input with placeholder containing activeBot name", () => {
    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={false}
        onCancel={() => {}}
      />,
    );
    expect(
      screen.getByPlaceholderText("Message Code Bot..."),
    ).toBeInTheDocument();
  });

  it("calls onSend with input text on Enter", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={onSend}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText("Message Code Bot...");
    await user.type(input, "Hello world");
    await user.keyboard("{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello world");
  });

  it("clears input after sending", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={onSend}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Message Code Bot...",
    ) as HTMLInputElement;
    await user.type(input, "Hello");
    await user.keyboard("{Enter}");

    expect(input.value).toBe("");
  });

  it("shows character count when typing", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText("Message Code Bot...");
    await user.type(input, "Hello");

    expect(screen.getByText("5/2000")).toBeInTheDocument();
  });

  it("shows cancel (X) button when isFetching is true", () => {
    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={true}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();

    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={true}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables input while fetching", () => {
    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={true}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText("Message Code Bot...")).toBeDisabled();
  });

  it("does not send empty input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={onSend}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText("Message Code Bot...");
    await user.type(input, "   ");
    await user.keyboard("{Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("enforces MAX_INPUT_LENGTH of 2000 characters", () => {
    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Message Code Bot...",
    ) as HTMLInputElement;

    // Use fireEvent.change for performance with large text
    fireEvent.change(input, { target: { value: "a".repeat(2500) } });

    // Input should be capped at 2000
    expect(input.value).toHaveLength(2000);
    expect(screen.getByText("2000/2000")).toBeInTheDocument();
  });

  it("shows amber warning color when near character limit (85%)", () => {
    renderWithProviders(
      <ChatInput
        activeBot="Code Bot"
        onSend={() => {}}
        isFetching={false}
        onCancel={() => {}}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Message Code Bot...",
    ) as HTMLInputElement;

    // Use fireEvent.change for performance
    fireEvent.change(input, { target: { value: "a".repeat(1701) } });

    // The character count should show with amber-400 class
    const charCount = screen.getByText("1701/2000");
    expect(charCount).toBeInTheDocument();
    expect(charCount.className).toContain("amber");
  });
});
