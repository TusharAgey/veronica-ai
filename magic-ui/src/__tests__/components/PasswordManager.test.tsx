import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordManager from "../../components/PasswordManager";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { ToastProvider } from "../../context/ToastContext";

// Mock the utils module to avoid actual crypto calls
vi.mock("../../utilities/utils", async () => {
  const actual = await vi.importActual("../../utilities/utils");
  return {
    ...actual,
    handleAddNewAccount: vi.fn(),
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
  return render(
    <Provider store={createMockStore()}>
      <ToastProvider>{ui}</ToastProvider>
    </Provider>,
  );
}

describe("PasswordManager", () => {
  it("renders the Add Account form", () => {
    renderWithProviders(<PasswordManager />);
    expect(screen.getByText("Add New Account")).toBeInTheDocument();
  });

  it("renders the Browse Password section", () => {
    renderWithProviders(<PasswordManager />);
    expect(screen.getByText("Browse Password")).toBeInTheDocument();
  });

  it("renders the Password Stats section", () => {
    renderWithProviders(<PasswordManager />);
    expect(screen.getByText("Total Saved")).toBeInTheDocument();
  });
});
