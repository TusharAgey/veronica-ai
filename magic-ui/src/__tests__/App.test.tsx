import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import App from "../App";
import chatsReducer from "../store/chatsSlice";
import { ToastProvider } from "../context/ToastContext";

// Mock framer-motion - strip out framer-motion specific props to avoid DOM warnings
function createMotionComponent(Tag: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({
    children,
    layout,
    initial,
    animate,
    exit,
    layoutId,
    ...props
  }: Record<string, any>) => React.createElement(Tag, props, children);
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

// Mock all lazy-loaded view components so they render synchronously in tests
const mockSetActiveTab = vi.fn();
vi.mock("../components/SideMenuBar", () => ({
  default: ({ activeTab, setActiveTab, isCollapsed }: any) => {
    // Store setActiveTab for assertions
    mockSetActiveTab.mockImplementation(setActiveTab);
    const NAV_ITEMS = [
      { id: "dashboard", label: "Dashboard" },
      { id: "passwords", label: "Passwords" },
      { id: "journal", label: "Journal" },
      { id: "chatbot", label: "Chatbot" },
      { id: "hologram", label: "Hologram" },
    ];
    return React.createElement(
      "div",
      { "data-testid": "sidebar" },
      NAV_ITEMS.map((item: any) =>
        React.createElement(
          "button",
          {
            key: item.id,
            title: item.label,
            "data-testid": `nav-${item.id}`,
            onClick: () => setActiveTab(item.id),
          },
          item.label,
        ),
      ),
      React.createElement("button", {
        "data-testid": "sidebar-toggle",
        onClick: () => {},
      }),
    );
  },
}));

vi.mock("../components/Dashboard", () => ({
  default: () => React.createElement("div", null, "AI Bots"),
}));

vi.mock("../components/PasswordManager", () => ({
  default: () =>
    React.createElement(
      "div",
      null,
      React.createElement("div", null, "Add New Account"),
      React.createElement("div", null, "Browse Password"),
      React.createElement("div", null, "Total Saved"),
    ),
}));

vi.mock("../components/Journal", () => ({
  default: () =>
    React.createElement("div", null, [
      React.createElement("textarea", {
        key: "journal-input",
        placeholder: "What's on your mind today?",
      }),
    ]),
}));

vi.mock("../components/Chatbot", () => ({
  default: () =>
    React.createElement("div", null, [
      React.createElement("input", {
        key: "chat-input",
        placeholder: "Message Code Bot...",
      }),
    ]),
}));

// Mock the hologram modal for the hologram tab test
vi.mock("../components/chatbot/hologram/HologramModal", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "hologram-modal" },
          "Hologram Modal",
          React.createElement("button", {
            "data-testid": "hologram-close",
            onClick: onClose,
          }),
        )
      : null,
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
  it("renders the sidebar with navigation items (collapsed by default)", async () => {
    renderWithProviders(<App />);
    // Sidebar starts collapsed, so nav items show as icon-only with title attributes
    // Use findBy queries to wait for lazy-loaded components to resolve
    expect(await screen.findByTitle("Dashboard")).toBeInTheDocument();
    expect(await screen.findByTitle("Passwords")).toBeInTheDocument();
    expect(await screen.findByTitle("Journal")).toBeInTheDocument();
    expect(await screen.findByTitle("Chatbot")).toBeInTheDocument();
    expect(await screen.findByTitle("Hologram")).toBeInTheDocument();
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

  it("shows Dashboard by default", async () => {
    renderWithProviders(<App />);
    expect(await screen.findByText("AI Bots")).toBeInTheDocument();
  });

  it("switches to Passwords tab when clicked", async () => {
    renderWithProviders(<App />);
    fireEvent.click(await screen.findByTitle("Passwords"));
    expect(await screen.findByText("Add New Account")).toBeInTheDocument();
  });

  it("switches to Journal tab when clicked", async () => {
    renderWithProviders(<App />);
    fireEvent.click(await screen.findByTitle("Journal"));
    expect(
      await screen.findByPlaceholderText("What's on your mind today?"),
    ).toBeInTheDocument();
  });

  it("switches to Chatbot tab when clicked", async () => {
    renderWithProviders(<App />);
    fireEvent.click(await screen.findByTitle("Chatbot"));
    expect(
      await screen.findByPlaceholderText("Message Code Bot..."),
    ).toBeInTheDocument();
  });

  it("switches to Hologram tab when clicked", async () => {
    renderWithProviders(<App />);
    fireEvent.click(await screen.findByTitle("Hologram"));
    expect(await screen.findByTestId("hologram-modal")).toBeInTheDocument();
  });

  it("closes Hologram modal and returns to Chatbot tab", async () => {
    renderWithProviders(<App />);
    fireEvent.click(await screen.findByTitle("Hologram"));
    expect(await screen.findByTestId("hologram-modal")).toBeInTheDocument();

    // Click the close button inside the hologram modal
    fireEvent.click(screen.getByTestId("hologram-close"));
    // Should switch back to chatbot view
    expect(
      await screen.findByPlaceholderText("Message Code Bot..."),
    ).toBeInTheDocument();
  });

  it("renders the sidebar element", async () => {
    renderWithProviders(<App />);
    expect(await screen.findByTestId("sidebar")).toBeInTheDocument();
  });
});
