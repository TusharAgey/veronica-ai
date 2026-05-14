import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import HologramModal from "../../../components/chatbot/hologram/HologramModal";
import chatsReducer from "../../../store/chatsSlice";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <div {...props}>{children}</div>,
    button: ({
      children,
      layout,
      layoutId,
      initial,
      animate,
      exit,
      ...props
    }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock animejs
vi.mock("animejs", () => ({
  default: vi.fn(() => ({
    pause: vi.fn(),
    finished: Promise.resolve(),
  })),
  timeline: vi.fn(() => ({
    add: vi.fn().mockReturnThis(),
    finished: Promise.resolve(),
  })),
  random: vi.fn(() => 0),
  stagger: vi.fn(() => 0),
}));

// Track calls to hooks for assertions
const mockInitSystem = vi.fn();
const mockCloseAudioSystem = vi.fn();
const mockHandleSend = vi.fn();

vi.mock("../../../components/chatbot/hologram/hooks/useHologramStyles", () => ({
  useHologramStyles: vi.fn(),
}));

vi.mock("../../../components/chatbot/hologram/hooks/useAudioSystem", () => ({
  useAudioSystem: () => ({
    initSystem: mockInitSystem,
    closeAudioSystem: mockCloseAudioSystem,
    audioRef: { current: new Audio() },
    analyserRef: { current: null },
    dataArrayRef: { current: null },
  }),
}));

vi.mock("../../../components/chatbot/hologram/hooks/useChatBot", () => ({
  useChatBot: () => ({
    handleSend: mockHandleSend,
    chatsRef: { current: [] },
  }),
}));

const mockRecognitionAbort = vi.fn();
const mockRecognitionStop = vi.fn();

vi.mock(
  "../../../components/chatbot/hologram/hooks/useSpeechRecognition",
  () => ({
    useSpeechRecognition: () => ({
      recognitionRef: {
        current: {
          abort: mockRecognitionAbort,
          stop: mockRecognitionStop,
        },
      },
    }),
  }),
);

vi.mock(
  "../../../components/chatbot/hologram/hooks/useHologramAnimation",
  () => ({
    useHologramAnimation: vi.fn(),
  }),
);

function createMockStore() {
  return configureStore({
    reducer: {
      chats: chatsReducer,
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<Provider store={createMockStore()}>{ui}</Provider>);
}

describe("HologramModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when isOpen is true", () => {
    renderWithProviders(<HologramModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("INITIALIZE SYSTEM")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    renderWithProviders(<HologramModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("INITIALIZE SYSTEM")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked (before audio active)", () => {
    const onClose = vi.fn();
    renderWithProviders(<HologramModal isOpen={true} onClose={onClose} />);
    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls initSystem when INITIALIZE SYSTEM overlay is clicked", () => {
    renderWithProviders(<HologramModal isOpen={true} onClose={() => {}} />);
    const overlay = screen.getByText("INITIALIZE SYSTEM");
    fireEvent.click(overlay);
    // initSystem is called via handleStateChange when state transitions to LISTENING
    expect(mockInitSystem).toHaveBeenCalled();
  });

  it("shows INITIALIZE SYSTEM overlay when audio is not active", () => {
    renderWithProviders(<HologramModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("INITIALIZE SYSTEM")).toBeInTheDocument();
    expect(screen.getByText("[ CLICK TO START ]")).toBeInTheDocument();
  });

  it("renders with correct structure", () => {
    const { container } = renderWithProviders(
      <HologramModal isOpen={true} onClose={() => {}} />,
    );
    const modalContainer = container.firstElementChild;
    expect(modalContainer?.className).toContain("fixed");
    expect(modalContainer?.className).toContain("inset-0");
  });

  it("calls closeAudioSystem when onClose is triggered", () => {
    const onClose = vi.fn();
    renderWithProviders(<HologramModal isOpen={true} onClose={onClose} />);
    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);
    // closeAudioSystem should be called as part of closeModal
    expect(mockCloseAudioSystem).toHaveBeenCalled();
  });

  it("calls recognition abort when closing modal", () => {
    const onClose = vi.fn();
    renderWithProviders(<HologramModal isOpen={true} onClose={onClose} />);
    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);
    expect(mockRecognitionAbort).toHaveBeenCalled();
  });

  it("calls recognition stop if abort throws an error", () => {
    mockRecognitionAbort.mockImplementationOnce(() => {
      throw new Error("Abort failed");
    });
    const onClose = vi.fn();
    renderWithProviders(<HologramModal isOpen={true} onClose={onClose} />);
    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);
    expect(mockRecognitionStop).toHaveBeenCalled();
  });
});
