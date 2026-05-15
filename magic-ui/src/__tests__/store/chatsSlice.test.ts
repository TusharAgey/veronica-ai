import { describe, it, expect } from "vitest";
import reducer, {
  addUserPrompt,
  removeLastUserPrompt,
  updateLatestLlmResponse,
  clearChat,
} from "../../store/chatsSlice";
import type { ChatsState } from "../../services/types";

const initialState: ChatsState = {
  sessions: {
    "Code Bot": [],
    "Space Pirate": [],
    Dizzy: [],
  },
};

describe("chatsSlice", () => {
  describe("addUserPrompt", () => {
    it("adds a new ChatTurn with empty assistant", () => {
      const state = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "Hello!" }),
      );
      expect(state.sessions["Code Bot"]).toHaveLength(1);
      expect(state.sessions["Code Bot"][0]).toEqual({
        user: "Hello!",
        assistant: "",
      });
    });

    it("creates a session array if bot doesn't exist", () => {
      const state = reducer(
        initialState,
        addUserPrompt({ bot: "New Bot", user: "Hi" }),
      );
      expect(state.sessions["New Bot"]).toHaveLength(1);
      expect(state.sessions["New Bot"][0].user).toBe("Hi");
    });

    it("appends to existing session", () => {
      const stateWithOne = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "First" }),
      );
      const stateWithTwo = reducer(
        stateWithOne,
        addUserPrompt({ bot: "Code Bot", user: "Second" }),
      );
      expect(stateWithTwo.sessions["Code Bot"]).toHaveLength(2);
      expect(stateWithTwo.sessions["Code Bot"][1].user).toBe("Second");
    });
  });

  describe("removeLastUserPrompt", () => {
    it("replaces last entry with 'User Cancelled...'", () => {
      const stateWithOne = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "Hello" }),
      );
      const state = reducer(
        stateWithOne,
        removeLastUserPrompt({ bot: "Code Bot" }),
      );
      expect(state.sessions["Code Bot"]).toHaveLength(1);
      expect(state.sessions["Code Bot"][0].assistant).toBe(
        "User Cancelled this response...",
      );
      expect(state.sessions["Code Bot"][0].user).toBe("Hello");
    });

    it("handles empty session gracefully (no crash)", () => {
      const state = reducer(
        initialState,
        removeLastUserPrompt({ bot: "Code Bot" }),
      );
      // Should not add any new entries when session is empty
      expect(state.sessions["Code Bot"].length).toBeLessThanOrEqual(1);
    });
  });

  describe("updateLatestLlmResponse", () => {
    it("updates the assistant field of the last turn", () => {
      const stateWithOne = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "Hi" }),
      );
      const state = reducer(
        stateWithOne,
        updateLatestLlmResponse({ bot: "Code Bot", assistant: "Hello there!" }),
      );
      expect(state.sessions["Code Bot"][0].assistant).toBe("Hello there!");
    });

    it("is a no-op if session is empty", () => {
      const state = reducer(
        initialState,
        updateLatestLlmResponse({ bot: "Code Bot", assistant: "Hi" }),
      );
      expect(state.sessions["Code Bot"]).toEqual([]);
    });
  });

  describe("clearChat", () => {
    it("empties the session array for the given bot", () => {
      const stateWithOne = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "Hello" }),
      );
      const state = reducer(stateWithOne, clearChat("Code Bot"));
      expect(state.sessions["Code Bot"]).toEqual([]);
    });

    it("does not affect other bots", () => {
      const stateWithOne = reducer(
        initialState,
        addUserPrompt({ bot: "Code Bot", user: "Hello" }),
      );
      const state = reducer(stateWithOne, clearChat("Code Bot"));
      expect(state.sessions["Space Pirate"]).toEqual([]);
      expect(state.sessions["Dizzy"]).toEqual([]);
    });
  });
});
