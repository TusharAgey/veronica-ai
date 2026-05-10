import { describe, it, expect } from "vitest";
import { store } from "../../store/store";

describe("Redux store", () => {
  it("is configured with all expected reducers", () => {
    const state = store.getState();
    expect(state).toHaveProperty("api");
    expect(state).toHaveProperty("llama");
    expect(state).toHaveProperty("llamaApi");
    expect(state).toHaveProperty("chats");
  });

  it("has the correct initial chats state", () => {
    const state = store.getState();
    expect(state.chats.sessions).toHaveProperty("Code Bot");
    expect(state.chats.sessions).toHaveProperty("Space Pirate");
    expect(state.chats.sessions).toHaveProperty("Dizzy");
    expect(state.chats.sessions["Code Bot"]).toEqual([]);
  });

  it("dispatches actions and updates state", () => {
    store.dispatch({
      type: "chats/addUserPrompt",
      payload: { bot: "Code Bot", user: "Test message" },
    });
    const state = store.getState();
    expect(state.chats.sessions["Code Bot"]).toHaveLength(1);
    expect(state.chats.sessions["Code Bot"][0].user).toBe("Test message");
  });
});
