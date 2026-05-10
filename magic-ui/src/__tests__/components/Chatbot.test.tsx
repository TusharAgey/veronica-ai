import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Chatbot from "../../components/Chatbot";
import chatsReducer from "../../store/chatsSlice";

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

// Mock the api services to prevent real HTTP calls
vi.mock("../../services/api", () => ({
  api: {
    reducerPath: "api",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  llama: {
    reducerPath: "llama",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useGetAccountsQuery: () => ({ data: [], isLoading: false }),
  useGetAccountDetailsQuery: () => ({ data: null, isLoading: false }),
  useCreateNewAccountMutation: () => [vi.fn(), { isLoading: false }],
  useGetActiveLLMModelQuery: () => ({ data: null, isLoading: false }),
}));

// Mock llamaApi to prevent real HTTP calls
vi.mock("../../services/llamaApi", () => ({
  llamaApi: {
    reducerPath: "llamaApi",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useLazyRunLlamaQuery: () => [vi.fn(), { data: undefined, isFetching: false }],
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

describe("Chatbot", () => {
  it("renders the bot selector", () => {
    renderWithProviders(<Chatbot />);
    expect(screen.getByText("Code Bot")).toBeInTheDocument();
  });

  it("renders the chat input area", () => {
    renderWithProviders(<Chatbot />);
    expect(
      screen.getByPlaceholderText("Message Code Bot..."),
    ).toBeInTheDocument();
  });

  it("renders the ZapBackdrop", () => {
    const { container } = renderWithProviders(<Chatbot />);
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(1);
  });
});
