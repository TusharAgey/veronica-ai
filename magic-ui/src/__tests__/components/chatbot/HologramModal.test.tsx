import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import HologramModal from "../../../components/chatbot/HologramModal";
import chatsReducer from "../../../store/chatsSlice";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

function createMockStore() {
  return configureStore({
    reducer: {
      chats: chatsReducer,
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<Provider store={createMockStore()}>{ui}</Provider>);
}

describe("HologramModal", () => {
  it("renders when isOpen is true", () => {
    renderWithProviders(<HologramModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("INITIALIZE SYSTEM")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithProviders(<HologramModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("INITIALIZE SYSTEM")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<HologramModal isOpen={true} onClose={onClose} />);
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
