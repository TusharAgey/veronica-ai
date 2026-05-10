import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "../App";
import chatsReducer from "../store/chatsSlice";
import { ToastProvider } from "../context/ToastContext";

// Mock framer-motion - strip out framer-motion specific props
function createMotionComponent(Tag: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ children, ...props }: Record<string, any>) =>
    React.createElement(Tag, props, children);
}

vi.mock("framer-motion", () => ({
  motion: {
    div: createMotionComponent("div"),
    nav: createMotionComponent("nav"),
    aside: createMotionComponent("aside"),
    span: createMotionComponent("span"),
    button: createMotionComponent("button"),
    main: createMotionComponent("main"),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AnimatePresence: ({ children }: { children: any }) => <>{children}</>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMotionTemplate: (fn: any) => fn,
  useMotionValue: (_initial: number) => ({
    get: () => _initial,
    set: vi.fn(),
  }),
}));

// Mock the api services to prevent real HTTP calls
vi.mock("../services/api", () => ({
  api: {
    reducerPath: "api",
    reducer: (state: Record<string, unknown> = {}) => state,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: () => (next: (action: any) => any) => (action: any) =>
      next(action),
  },
  llama: {
    reducerPath: "llama",
    reducer: (state: Record<string, unknown> = {}) => state,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: () => (next: (action: any) => any) => (action: any) =>
      next(action),
  },
  useGetAccountsQuery: () => ({ data: [], isLoading: false }),
  useGetAccountDetailsQuery: () => ({ data: null, isLoading: false }),
  useCreateNewAccountMutation: () => [vi.fn(), { isLoading: false }],
  useGetActiveLLMModelQuery: () => ({ data: null, isLoading: false }),
}));

// Mock llamaApi to prevent real HTTP calls
vi.mock("../services/llamaApi", () => ({
  llamaApi: {
    reducerPath: "llamaApi",
    reducer: (state: Record<string, unknown> = {}) => state,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: () => (next: (action: any) => any) => (action: any) =>
      next(action),
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
  return render(
    <Provider store={createMockStore()}>
      <ToastProvider>{ui}</ToastProvider>
    </Provider>,
  );
}

describe("App", () => {
  it("renders the sidebar with navigation items (collapsed by default)", () => {
    renderWithProviders(<App />);
    // Sidebar starts collapsed, so nav items show as icon-only with title attributes
    expect(screen.getByTitle("Dashboard")).toBeInTheDocument();
    expect(screen.getByTitle("Passwords")).toBeInTheDocument();
    expect(screen.getByTitle("Journal")).toBeInTheDocument();
    expect(screen.getByTitle("Chatbot")).toBeInTheDocument();
    expect(screen.getByTitle("Hologram")).toBeInTheDocument();
  });

  it("renders the SpatialEnvironment background", () => {
    const { container } = renderWithProviders(<App />);
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(6);
  });

  it("renders the TopHeader", () => {
    renderWithProviders(<App />);
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it("shows Dashboard by default", () => {
    renderWithProviders(<App />);
    expect(screen.getByText("AI Bots")).toBeInTheDocument();
  });

  it("switches to Passwords tab when clicked", () => {
    renderWithProviders(<App />);
    fireEvent.click(screen.getByTitle("Passwords"));
    expect(screen.getByText("Add New Account")).toBeInTheDocument();
  });

  it("switches to Journal tab when clicked", () => {
    renderWithProviders(<App />);
    fireEvent.click(screen.getByTitle("Journal"));
    expect(
      screen.getByPlaceholderText("What's on your mind today?"),
    ).toBeInTheDocument();
  });

  it("switches to Chatbot tab when clicked", () => {
    renderWithProviders(<App />);
    fireEvent.click(screen.getByTitle("Chatbot"));
    expect(
      screen.getByPlaceholderText("Message Code Bot..."),
    ).toBeInTheDocument();
  });
});
