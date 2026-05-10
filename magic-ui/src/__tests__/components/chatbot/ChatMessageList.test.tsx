import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessageList } from "../../../components/chatbot/ChatMessageList";
import type { ChatTurn } from "../../../services/types";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock scrollIntoView on the ref
Element.prototype.scrollIntoView = vi.fn();

const sampleChats: ChatTurn[] = [
  { user: "Hello", assistant: "Hi there!" },
  { user: "How are you?", assistant: "I'm doing great!" },
];

describe("ChatMessageList", () => {
  it("renders user messages", () => {
    render(<ChatMessageList chats={sampleChats} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
  });

  it("shows TypingIndicator when assistant is empty string", () => {
    const chats: ChatTurn[] = [{ user: "Hi", assistant: "" }];
    render(<ChatMessageList chats={chats} />);
    // The TypingIndicator renders 3 bouncing dots
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
    // Should render the scroll container without any chat messages
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
});
