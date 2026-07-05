import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  // The reveal button is the one that contains an SVG with the eye icon
  const buttons = screen.getAllByRole("button");
  // The reveal button is the one that is NOT the dropdown trigger and NOT a dropdown option
  // It's the button that has an SVG child with class containing "lucide-eye" or "lucide-eye-off"
  return buttons.find(
    (btn) =>
      btn.querySelector("svg.lucide-eye, svg.lucide-eye-off") !== null ||
      btn.innerHTML.includes("lucide-eye"),
  )!;
}

/** Helper: open the searchable select dropdown and click the given account name */
function selectAccount(accountName: string) {
  // Click the trigger button to open the dropdown
  const trigger = screen.getByRole("button", {
    name: /select account/i,
  });
  fireEvent.click(trigger);

  // Click the desired option in the dropdown
  const option = screen.getByRole("button", { name: accountName });
  fireEvent.click(option);
}

describe("BrowsePassword", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    mockDeleteAccountState.isError = false;
    mockDeleteAccountState.isSuccess = false;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
    // Open the dropdown
    const trigger = screen.getByRole("button", {
      name: /select account/i,
    });
    fireEvent.click(trigger);

    // Now the options should be visible
    expect(
      screen.getByRole("button", { name: "Account1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Account2" }),
    ).toBeInTheDocument();
  });

  it("shows account details when an account is selected", () => {
    renderWithProviders(<BrowsePassword />);
    selectAccount("Account1");

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test account description")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

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

  it("shows masked password when not revealed", () => {
    renderWithProviders(<BrowsePassword />);
    selectAccount("Account1");
    expect(screen.getByText("***********")).toBeInTheDocument();
  });

  it("shows Eye icon on the reveal button", () => {
    renderWithProviders(<BrowsePassword />);
    const revealButton = getRevealButton();
    // The Eye icon is rendered as an SVG inside the button
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

    // Flush the promise from decryptModern
    await vi.advanceTimersByTimeAsync(0);

    expect(mockDecryptModern).toHaveBeenCalledWith(
      "encrypted-pass-data",
      "1234567890123456",
    );
    expect(screen.getByText("decrypted-pass")).toBeInTheDocument();
  });

  it("copies the decrypted password and shows a success toast", async () => {
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Flush the promise from decryptModern
    await vi.advanceTimersByTimeAsync(0);

    // Copy button is the one with a Copy icon (lucide-copy), before the delete button
    const copyButton = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("lucide-copy"))!;
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "decrypted-pass",
    );
    expect(
      screen.getByText("Password copied to clipboard!"),
    ).toBeInTheDocument();
  });

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
      // After deletion, the trigger should show the placeholder again
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

  it("auto-hides the password after 1 minute", async () => {
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption to complete (flushes the promise microtask)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("decrypted-pass")).toBeInTheDocument();

    // The reveal button should show EyeOff (password is visible)
    expect(getRevealButton().innerHTML).toContain("lucide-eye-off");

    // Advance time by 1 minute to trigger the auto-hide timeout
    // (the setTimeout is scheduled inside the .then() handler)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });

    // Password should be masked again
    expect(screen.getByText("***********")).toBeInTheDocument();

    // The reveal button should show Eye (password is hidden)
    expect(getRevealButton().innerHTML).toContain("lucide-eye");
  });

  it("disables the reveal button after auto-hide timeout clears the session password", async () => {
    renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption to complete (flushes the promise microtask)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // The reveal button should be enabled while password is visible
    expect(getRevealButton()).toBeEnabled();

    // Advance time by 1 minute to trigger the auto-hide timeout
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });

    // The reveal button should be disabled again because the session
    // password state was cleared (length is no longer 16)
    expect(getRevealButton()).toBeDisabled();
  });

  it("does not auto-hide if component unmounts before timeout", async () => {
    const { unmount } = renderWithProviders(<BrowsePassword />);

    selectAccount("Account1");
    fireEvent.change(screen.getByPlaceholderText("Session Password"), {
      target: { value: "1234567890123456" },
    });
    fireEvent.click(getRevealButton());

    // Wait for decryption to complete
    await vi.advanceTimersByTimeAsync(0);
    expect(screen.getByText("decrypted-pass")).toBeInTheDocument();

    // Unmount the component before the 1 minute timeout
    unmount();

    // Advance time past the timeout — should not throw (cleanup worked)
    await vi.advanceTimersByTimeAsync(60000);

    // No assertion needed — the test passes if no error is thrown
    // (the active flag prevented setState on unmounted component)
    expect(mockDecryptModern).toHaveBeenCalledTimes(1);
  });
});
