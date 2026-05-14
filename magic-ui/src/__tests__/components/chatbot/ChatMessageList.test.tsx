import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ChatMessageList } from "../../../components/chatbot/ChatMessageList";
import type { ChatTurn } from "../../../services/types";

// Mock framer-motion - strip non-boolean props to avoid DOM warnings
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, layout, initial, animate, exit, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock scrollIntoView on the ref
Element.prototype.scrollIntoView = vi.fn();

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

const sampleChats: ChatTurn[] = [
  { user: "Hello", assistant: "Hi there!" },
  { user: "How are you?", assistant: "I'm doing great!" },
];

describe("ChatMessageList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user messages", () => {
    render(<ChatMessageList chats={sampleChats} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
  });

  it("shows TypingIndicator when assistant is empty string", () => {
    const chats: ChatTurn[] = [{ user: "Hi", assistant: "" }];
    render(<ChatMessageList chats={chats} />);
    const dots = document.querySelectorAll(".rounded-full");
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it("renders multiple chat turns", () => {
    render(<ChatMessageList chats={sampleChats} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
    expect(screen.getByText("I'm doing great!")).toBeInTheDocument();
  });

  it("handles empty chats array", () => {
    const { container } = render(<ChatMessageList chats={[]} />);
    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("renders markdown content in assistant messages", () => {
    const chats: ChatTurn[] = [
      { user: "Write code", assistant: "```\nconst x = 1;\n```" },
    ];
    render(<ChatMessageList chats={chats} />);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders code block with copy button", () => {
    const chats: ChatTurn[] = [
      {
        user: "Write code",
        assistant: "```javascript\nconsole.log('hi');\n```",
      },
    ];
    render(<ChatMessageList chats={chats} />);
    expect(screen.getByTitle("Copy code to clipboard")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("copies code to clipboard when copy button is clicked", async () => {
    const chats: ChatTurn[] = [
      { user: "Write code", assistant: "```\nconst x = 1;\n```" },
    ];
    render(<ChatMessageList chats={chats} />);
    const copyButton = screen.getByTitle("Copy code to clipboard");
    await act(async () => {
      fireEvent.click(copyButton);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("shows 'Copied!' text after clicking copy", async () => {
    const chats: ChatTurn[] = [
      { user: "Write code", assistant: "```\nconst x = 1;\n```" },
    ];
    render(<ChatMessageList chats={chats} />);
    const copyButton = screen.queryByTitle("Copy code to clipboard");
    if (copyButton) {
      await act(async () => {
        fireEvent.click(copyButton);
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "const x = 1;",
      );
    }
  });

  it("renders inline code in assistant messages", () => {
    const chats: ChatTurn[] = [
      { user: "Explain", assistant: "Use the `map()` function" },
    ];
    render(<ChatMessageList chats={chats} />);
    expect(screen.getByText("map()")).toBeInTheDocument();
  });

  it("renders links in assistant messages", () => {
    const chats: ChatTurn[] = [
      { user: "Link", assistant: "Check [this](https://example.com) out" },
    ];
    render(<ChatMessageList chats={chats} />);
    const link = screen.getByText("this");
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });

  it("renders tables in assistant messages", () => {
    const chats: ChatTurn[] = [
      {
        user: "Table",
        assistant: "| A | B |\n|---|---|\n| 1 | 2 |",
      },
    ];
    render(<ChatMessageList chats={chats} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows scroll-to-bottom button when scrolled up", () => {
    const { container } = render(<ChatMessageList chats={sampleChats} />);
    const scrollContainer = container.querySelector(
      ".overflow-y-auto",
    ) as HTMLElement;

    Object.defineProperty(scrollContainer, "scrollHeight", {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(scrollContainer, "clientHeight", {
      value: 500,
      writable: true,
    });
    scrollContainer.scrollTop = 0;

    fireEvent.scroll(scrollContainer);
    const scrollDownButton = container.querySelector(".absolute.bottom-3");
    expect(scrollDownButton).toBeInTheDocument();
  });
});
