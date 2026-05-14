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

  it("allows typing in all form fields", async () => {
    renderWithProviders(<AddAccountForm />);
    const accountInput = screen.getByPlaceholderText("Account Name");
    fireEvent.change(accountInput, { target: { value: "MyAccount" } });
    expect(accountInput).toHaveValue("MyAccount");

    const userInput = screen.getByPlaceholderText("User Name");
    fireEvent.change(userInput, { target: { value: "myuser" } });
    expect(userInput).toHaveValue("myuser");

    const emailInput = screen.getByPlaceholderText("Email ID");
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    expect(emailInput).toHaveValue("test@test.com");

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    expect(passwordInput).toHaveValue("secret123");

    const descInput = screen.getByPlaceholderText("Description");
    fireEvent.change(descInput, { target: { value: "My description" } });
    expect(descInput).toHaveValue("My description");

    const sessionInput = screen.getByPlaceholderText("Session Password");
    fireEvent.change(sessionInput, { target: { value: "session123" } });
    expect(sessionInput).toHaveValue("session123");
  });

  it("submits the form when submit button is clicked", () => {
    renderWithProviders(<AddAccountForm />);
    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText("Account Name"), {
      target: { value: "MyAccount" },
    });
    fireEvent.change(screen.getByPlaceholderText("User Name"), {
      target: { value: "myuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email ID"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "session123" },
    });

    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);
    // handleAddNewAccount is mocked, so this just verifies no crash
  });
});
