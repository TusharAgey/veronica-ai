import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../../context/ToastContext";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

function TestConsumer() {
  const { toast, error, success } = useToast();
  return (
    <div>
      <button onClick={() => toast("Info toast")}>Show Info</button>
      <button onClick={() => error("Error toast")}>Show Error</button>
      <button onClick={() => success("Success toast")}>Show Success</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <TestConsumer />
    </ToastProvider>,
  );
}

describe("ToastContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows info toast on button click", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("Show Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();
  });

  it("shows error toast on button click", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("Show Error"));
    expect(screen.getByText("Error toast")).toBeInTheDocument();
  });

  it("shows success toast on button click", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("Show Success"));
    expect(screen.getByText("Success toast")).toBeInTheDocument();
  });

  it("auto-dismisses toast after 4 seconds", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("Show Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText("Info toast")).not.toBeInTheDocument();
  });

  it("manually dismisses toast on X button click", () => {
    renderWithProvider();
    fireEvent.click(screen.getByText("Show Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(screen.queryByText("Info toast")).not.toBeInTheDocument();
  });

  it("does not show duplicate toasts with the same message", () => {
    renderWithProvider();
    const infoButton = screen.getByText("Show Info");

    // Click the same button twice
    fireEvent.click(infoButton);
    fireEvent.click(infoButton);

    // Should only have one toast rendered
    const toasts = screen.getAllByText("Info toast");
    expect(toasts).toHaveLength(1);
  });
});
