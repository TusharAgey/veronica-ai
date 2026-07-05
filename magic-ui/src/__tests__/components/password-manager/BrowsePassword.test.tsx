import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowsePassword } from "../../../components/password-manager/BrowsePassword";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../../../services/api";
import { ToastProvider } from "../../../context/ToastContext";

// Use vi.hoisted to avoid hoisting issues with vi.mock factory
const { mockDecryptModern, mockDeleteAccountState, mockDeleteAccount } =
  vi.hoisted(() => ({
    mockDecryptModern: vi.fn().mockResolvedValue("decrypted-pass"),
    mockDeleteAccountState: { isError: false, isSuccess: false },
    mockDeleteAccount: vi.fn(() => Promise.resolve({ data: undefined })),
  }));

// Mock inactivity timer — tests control the return values
const mockInactivity = vi.hoisted(() => ({
  isCosmeticallyHidden: false,
  isHardLocked: false,
  resetActivity: vi.fn(),
}));

vi.mock("../../../hooks/useInactivityTimer", () => ({
  useInactivityTimer: () => ({
    isCosmeticallyHidden: mockInactivity.isCosmeticallyHidden,
    isHardLocked: mockInactivity.isHardLocked,
    resetActivity: mockInactivity.resetActivity,
  }),
}));

vi.mock("../../../utilities/utils", async () => {
  const actual = await vi.importActual("../../../utilities/utils");
  return {
    ...actual,
    decryptModern: mockDecryptModern,
  };
});

// Mock the api hooks to provide controlled test data
const mockAccounts = ["Account1", "Account2"];
const mockAccountDetails = {
  account_name: "Account1",
  username: "testuser",
  email: "test@test.com",
  password: "encrypted-pass-data",
  account_description: "Test account description",
  creation_date: "2024-01-01",
};

vi.mock("../../../services/api", async () => {
  const actual = await vi.importActual("../../../services/api");
  return {
    ...actual,
    useGetAccountsQuery: () => ({ data: mockAccounts, isLoading: false }),
    useGetAccountDetailsQuery: (_accountName: string, _options: any) => ({
      data: mockAccountDetails,
      currentData: _options?.skip ? undefined : mockAccountDetails,
      isLoading: false,
    }),
    useDeleteAccountMutation: () => [mockDeleteAccount, mockDeleteAccountState],
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

/** Find the reveal/hide toggle button (the one with Eye/EyeOff icon) */
function getRevealButton(): HTMLElement {
  const buttons = screen.getAllByRole("button");
  return buttons.find(
    (btn) =>
      btn.querySelector("svg.lucide-eye, svg.lucide-eye-off") !== null ||
      btn.innerHTML.includes("lucide-eye"),
  )!;
}

/** Helper: open the searchable select dropdown and click the given account name */
function selectAccount(accountName: string) {
  const trigger = screen.getByRole("button", {
    name: /select account/i,
  });
  fireEvent.click(trigger);

  const option = screen.getByRole("button", { name: accountName });
  fireEvent.click(option);
}

describe("BrowsePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteAccountState.isError = false;
    mockDeleteAccountState.isSuccess = false;
    // Reset inactivity mock to default (not hidden, not locked)
    mockInactivity.isCosmeticallyHidden = false;
    mockInactivity.isHardLocked = false;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  // ─── Basic Rendering ───────────────────────────────────────────────

  it("renders the title", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByText("Browse Password")).toBeInTheDocument();
  });

  it("renders the account selector with placeholder", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByText("Select account...")).toBeInTheDocument();
  });

  it("renders the session password input", () => {
    renderWithProviders(<BrowsePassword />);
    expect(screen.getByPlaceholderText("Session Password")).toBeInTheDocument();
  });

  it("renders the reveal/hide button", () => {
    renderWithProviders(<BrowsePassword />);
    const revealButton = getRevealButton();
    expect(revealButton).toBeInTheDocument();
  });

  it("renders account options in the dropdown", () => {
    renderWithProviders(<BrowsePassword />);
    const trigger = screen.getByRole("button", {
      name: /select account/i,
    });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("button", { name: "Account1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account2" }),
    ).toBeInTheDocument();
  });

  // ─── Account Details ───────────────────────────────────────────────

  it("shows account details when an account is selected", () => {
    renderWithProviders(<BrowsePassword />);
    selectAccount("Account1");

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test account description")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  // ─── Reveal Button State ───────────────────────────────────────────

  it("reveal button is disabled when session password is not 16 characters", () => {
    renderWithProviders(<BrowsePassword />);
    const revealButton = getRevealButton();
    expect(revealButton).toBeDisabled();
  });

  it("enables the reveal button when an account is selected and the session password is 16 characters", () => {
    renderWithProviders(<BrowsePassword />);
    selectAccount("Account1");

    const sessionInput = screen.getByPlaceholderText("Session Password");
    fireEvent.change(sessionInput, { target: { value: "1234567890123456" } });
    const revealButton = getRevealButton();
    expect(revealButton).toBeEnabled();
  });

  // ─── Password Display ──────────────────────────────────────────────

  it("shows masked password when not revealed", () => {
    renderWithProviders(<BrowsePassword />);
    selectAccount("Account1");
    expect(screen.getByText("***********")).toBeInTheDocument();
  });

  it("shows Eye icon on the reveal button", () => {
    renderWithProviders(<BrowsePassword />);
    const revealButton = getRevealButton();
    const svg = revealButton.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("decrypts and displays the password after reveal is clicked", async () => {
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    expect(screen.getByText("Decrypting...")).toBeInTheDocument();

    // Wait for the decryptModern promise to resolve
    await waitFor(() => {
      expect(mockDecryptModern).toHaveBeenCalledWith(
        "encrypted-pass-data",
        "1234567890123456",
      );
      expect(screen.getByText("decrypted-pass")).toBeInTheDocument();
    });
  });

  it("copies the decrypted password and shows a success toast", async () => {
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    await screen.findByText("decrypted-pass");

    const copyButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("lucide-copy"))!;
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "decrypted-pass",
    );
    expect(
      await screen.findByText("Password copied to clipboard!"),
    ).toBeInTheDocument();
  });

  // ─── Delete Account ────────────────────────────────────────────────

  it("does not delete the selected account when confirmation is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    const deleteButton = screen.getAllByRole("button").at(-1)!;
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith(
      'Delete account "Account1"?\n\nThis can be restored later.',
    );
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it("deletes the selected account after confirmation and resets the selection", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    const deleteButton = screen.getAllByRole("button").at(-1)!;
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledWith("Account1");
      expect(
        screen.getByRole("button", { name: /select account/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows delete success and error toast messages from mutation state", async () => {
    mockDeleteAccountState.isSuccess = true;
    const { rerender } = renderWithProviders(<BrowsePassword />);

    expect(
      await screen.findByText("Succesfully Deleted the account!"),
    ).toBeInTheDocument();

    mockDeleteAccountState.isSuccess = false;
    mockDeleteAccountState.isError = true;
    rerender(
      <Provider store={createMockStore()}>
        <ToastProvider>
          <BrowsePassword />
        </ToastProvider>
      </Provider>,
    );

    expect(
      await screen.findByText(
        "Failed to delete the account. Perhapse, the server is down",
      ),
    ).toBeInTheDocument();
  });

  // ─── Inactivity-Based Auto-Hide ────────────────────────────────────

  it("hides the password on cosmetic timeout (keeps session password)", async () => {
    const { rerender } = renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption
    await screen.findByText("decrypted-pass");
    expect(getRevealButton().innerHTML).toContain("lucide-eye-off");

    // Simulate cosmetic timeout — password display hidden, session stays
    mockInactivity.isCosmeticallyHidden = true;
    mockInactivity.isHardLocked = false;
    rerender(
      <Provider store={createMockStore()}>
        <ToastProvider>
          <BrowsePassword />
        </ToastProvider>
      </Provider>,
    );

    // Password should be masked
    expect(screen.getByText("***********")).toBeInTheDocument();
    // Reveal button shows Eye (hidden state)
    expect(getRevealButton().innerHTML).toContain("lucide-eye");
    // Session password should still be intact (reveal button enabled)
    expect(getRevealButton()).toBeEnabled();
  });

  it("clears the session password on hard lock", async () => {
    const { rerender } = renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption
    await screen.findByText("decrypted-pass");
    expect(getRevealButton()).toBeEnabled();

    // Simulate hard lock — session password cleared
    mockInactivity.isCosmeticallyHidden = true;
    mockInactivity.isHardLocked = true;
    rerender(
      <Provider store={createMockStore()}>
        <ToastProvider>
          <BrowsePassword />
        </ToastProvider>
      </Provider>,
    );

    // Password should be masked
    expect(screen.getByText("***********")).toBeInTheDocument();
    // Reveal button should be disabled (session password was cleared)
    expect(getRevealButton()).toBeDisabled();
  });

  it("hides password immediately on cosmetic timeout even without hard lock", async () => {
    const { rerender } = renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption
    await screen.findByText("decrypted-pass");

    // Simulate cosmetic-only timeout (hard lock not triggered)
    mockInactivity.isCosmeticallyHidden = true;
    mockInactivity.isHardLocked = false;
    rerender(
      <Provider store={createMockStore()}>
        <ToastProvider>
          <BrowsePassword />
        </ToastProvider>
      </Provider>,
    );

    // Password hidden but session still alive
    expect(screen.getByText("***********")).toBeInTheDocument();
    expect(getRevealButton()).toBeEnabled();
  });

  it("does not affect non-revealed state when inactivity triggers", () => {
    const { rerender } = renderWithProviders(<BrowsePassword />);

    // Component rendered with password not revealed
    selectAccount("Account1");

    // Password is masked initially
    expect(screen.getByText("***********")).toBeInTheDocument();

    // Simulate cosmetic timeout
    mockInactivity.isCosmeticallyHidden = true;
    rerender(
      <Provider store={createMockStore()}>
        <ToastProvider>
          <BrowsePassword />
        </ToastProvider>
      </Provider>,
    );

    // Should still be masked (no change needed)
    expect(screen.getByText("***********")).toBeInTheDocument();
  });
});
