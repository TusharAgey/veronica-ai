import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddAccountForm } from "../../../components/password-manager/AddAccountForm";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../../services/api";
import { ToastProvider } from "../../../context/ToastContext";

// Use vi.hoisted to avoid hoisting issues with vi.mock factory
const { mockHandleAddNewAccount } = vi.hoisted(() => ({
  mockHandleAddNewAccount: vi.fn(),
}));

vi.mock("../../../utilities/utils", async () => {
  const actual = await vi.importActual("../../../utilities/utils");
  return {
    ...actual,
    handleAddNewAccount: mockHandleAddNewAccount,
  };
});

// Mock the api service hooks
const mockCreateNewAccount = vi.fn();
vi.mock("../../../services/api", async () => {
  const actual = await vi.importActual("../../../services/api");
  return {
    ...actual,
    useCreateNewAccountMutation: () => [
      mockCreateNewAccount,
      { isError: false, isSuccess: false },
    ],
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("allows typing in all form fields", () => {
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

  it("renders form fields with correct ids", () => {
    renderWithProviders(<AddAccountForm />);
    expect(screen.getByPlaceholderText("Account Name")).toHaveAttribute(
      "id",
      "account-name",
    );
    expect(screen.getByPlaceholderText("User Name")).toHaveAttribute(
      "id",
      "user-name",
    );
    expect(screen.getByPlaceholderText("Email ID")).toHaveAttribute(
      "id",
      "email-id",
    );
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute(
      "id",
      "password",
    );
    expect(screen.getByPlaceholderText("Description")).toHaveAttribute(
      "id",
      "account-description",
    );
    expect(screen.getByPlaceholderText("Session Password")).toHaveAttribute(
      "id",
      "session-password",
    );
  });

  it("renders a form element", () => {
    renderWithProviders(<AddAccountForm />);
    const form = screen
      .getByRole("button", { name: /submit/i })
      .closest("form");
    expect(form).toBeInTheDocument();
  });

  it("renders the lock icon", () => {
    renderWithProviders(<AddAccountForm />);
    const { container } = renderWithProviders(<AddAccountForm />);
    const lockSvgs = container.querySelectorAll("svg");
    expect(lockSvgs.length).toBeGreaterThanOrEqual(1);
  });
});
