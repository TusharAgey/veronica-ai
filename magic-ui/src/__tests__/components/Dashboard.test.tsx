import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "../../components/Dashboard";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Mock framer-motion for MagicCard - strip non-boolean props
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  useMotionTemplate: (fn: any) => fn,
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: vi.fn(),
  }),
}));

// Mock RTK Query hooks to prevent real API calls and act() warnings
vi.mock("../../services/api", async () => {
  const actual = await vi.importActual("../../services/api");
  return {
    ...actual,
    useGetAccountsQuery: () => ({ data: [], isLoading: false }),
  };
});

function createMockStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<Provider store={createMockStore()}>{ui}</Provider>);
}

describe("Dashboard", () => {
  it("shows AI Bots section", () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("AI Bots")).toBeInTheDocument();
  });

  it("shows Space Pirate and Code Bot in the list", () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("Space Pirate")).toBeInTheDocument();
    expect(screen.getByText("Code Bot")).toBeInTheDocument();
  });

  it("shows the current weekday", () => {
    renderWithProviders(<Dashboard />);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    expect(weekdays.some((day) => screen.queryByText(day))).toBeTruthy();
  });

  it("shows saved passwords count", () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("Saved Passwords")).toBeInTheDocument();
  });
});
