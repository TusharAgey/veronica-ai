import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowsePassword } from "../../../components/password-manager/BrowsePassword";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../../services/api";

// Mock the utils module to avoid actual crypto calls
vi.mock("../../../utilities/utils", async () => {
  const actual = await vi.importActual("../../../utilities/utils");
  return {
    ...actual,
    decryptModern: vi.fn().mockResolvedValue("decrypted-pass"),
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

describe("BrowsePassword", () => {
  it("renders the title", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByText("Browse Password")).toBeInTheDocument();
  });

  it("renders the account selector", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByText("Select account...")).toBeInTheDocument();
  });

  it("renders the session password input", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByPlaceholderText("Session Password")).toBeInTheDocument();
  });

  it("renders the reveal/hide button", () => {
    renderWithProviders(<BrowsePassword />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
