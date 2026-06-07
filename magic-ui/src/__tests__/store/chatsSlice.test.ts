import { describe, it, expect } from "vitest";
import reducer, {
  addUserPrompt,
  clearChat,
  createSession,
  deleteSession,
  hydrateChatHistory,
  removeLastUserPrompt,
  renameSession,
  setActiveSession,
  setSearchQuery,
  toggleHistoryPanel,
  updateLatestLlmResponse,
} from "../../store/chatsSlice";
import type { ChatHistoryState } from "../../services/types";

const emptyState: ChatHistoryState = {
  sessions: {},
  messages: {},
  activeSessionId: null,
  searchQuery: "",
  panelOpen: false,
};

function stateWithSession(id = "session-1", bot = "Code Bot"): ChatHistoryState {
  return reducer(emptyState, createSession({ id, bot }));
}

describe("chatsSlice", () => {
  it("creates a session with metadata and empty messages", () => {
    const state = stateWithSession();

    expect(state.activeSessionId).toBe("session-1");
    expect(state.sessions["session-1"]).toMatchObject({
      id: "session-1",
      bot: "Code Bot",
      name: "Chat with Code Bot",
      messageCount: 0,
      lastMessagePreview: "",
    });
    expect(state.messages["session-1"]).toEqual([]);
  });

  it("adds a new ChatTurn with empty assistant", () => {
    const state = reducer(
      stateWithSession(),
      addUserPrompt({ sessionId: "session-1", user: "Hello!" }),
    );

    expect(state.messages["session-1"]).toEqual([
      { user: "Hello!", assistant: "" },
    ]);
    expect(state.sessions["session-1"].messageCount).toBe(1);
    expect(state.sessions["session-1"].lastMessagePreview).toBe("Hello!");
  });

  it("appends to existing session", () => {
    const stateWithOne = reducer(
      stateWithSession(),
      addUserPrompt({ sessionId: "session-1", user: "First" }),
    );
    const stateWithTwo = reducer(
      stateWithOne,
      addUserPrompt({ sessionId: "session-1", user: "Second" }),
    );

    expect(stateWithTwo.messages["session-1"]).toHaveLength(2);
    expect(stateWithTwo.messages["session-1"][1].user).toBe("Second");
    expect(stateWithTwo.sessions["session-1"].messageCount).toBe(2);
  });

  it("marks last entry as cancelled", () => {
    const stateWithOne = reducer(
      stateWithSession(),
      addUserPrompt({ sessionId: "session-1", user: "Hello" }),
    );
    const state = reducer(
      stateWithOne,
      removeLastUserPrompt({ sessionId: "session-1" }),
    );

    expect(state.messages["session-1"]).toEqual([
      { user: "Hello", assistant: "User Cancelled this response..." },
    ]);
  });

  it("handles empty session cancellation gracefully", () => {
    const state = reducer(
      stateWithSession(),
      removeLastUserPrompt({ sessionId: "session-1" }),
    );

    expect(state.messages["session-1"]).toEqual([]);
  });

  it("updates the assistant field of the last turn", () => {
    const stateWithOne = reducer(
      stateWithSession(),
      addUserPrompt({ sessionId: "session-1", user: "Hi" }),
    );
    const state = reducer(
      stateWithOne,
      updateLatestLlmResponse({
        sessionId: "session-1",
        assistant: "Hello there!",
      }),
    );

    expect(state.messages["session-1"][0].assistant).toBe("Hello there!");
  });

  it("clears messages for a session without deleting metadata", () => {
    const stateWithOne = reducer(
      stateWithSession(),
      addUserPrompt({ sessionId: "session-1", user: "Hello" }),
    );
    const state = reducer(stateWithOne, clearChat("session-1"));

    expect(state.messages["session-1"]).toEqual([]);
    expect(state.sessions["session-1"].messageCount).toBe(0);
    expect(state.sessions["session-1"].lastMessagePreview).toBe("");
  });

  it("deletes a session and clears activeSessionId when needed", () => {
    const state = reducer(stateWithSession(), deleteSession("session-1"));

    expect(state.sessions["session-1"]).toBeUndefined();
    expect(state.messages["session-1"]).toBeUndefined();
    expect(state.activeSessionId).toBeNull();
  });

  it("renames a session", () => {
    const state = reducer(
      stateWithSession(),
      renameSession({ id: "session-1", name: "Renamed" }),
    );

    expect(state.sessions["session-1"].name).toBe("Renamed");
  });

  it("sets active session, panel state, and search query", () => {
    let state = reducer(stateWithSession(), setActiveSession("session-1"));
    state = reducer(state, toggleHistoryPanel());
    state = reducer(state, setSearchQuery("code"));

    expect(state.activeSessionId).toBe("session-1");
    expect(state.panelOpen).toBe(true);
    expect(state.searchQuery).toBe("code");
  });

  it("hydrates chat history", () => {
    const saved = stateWithSession("saved-session", "Space Pirate");
    const state = reducer(emptyState, hydrateChatHistory(saved));

    expect(state.activeSessionId).toBe("saved-session");
    expect(state.sessions["saved-session"].bot).toBe("Space Pirate");
  });
});
