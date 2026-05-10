import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddAccountForm } from "../../../components/password-manager/AddAccountForm";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../../services/api";
import { ToastProvider } from "../../../context/ToastContext";

// Mock the utils module to avoid actual crypto calls
vi.mock("../../../utilities/utils", async () => {
  const actual = await vi.importActual("../../../utilities/utils");
  return {
    ...actual,
    handleAddNewAccount: vi.fn(),
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

describe("AddAccountForm", () => {
  it("renders all form fields", () => {
    renderWithProviders(<AddAccountForm />);
    expect(screen.getByPlaceholderText("Account Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("User Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email ID")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Session Password")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    renderWithProviders(<AddAccountForm />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders the title", () => {
    renderWithProviders(<AddAccountForm />);
    expect(screen.getByText("Add New Account")).toBeInTheDocument();
  });
});
