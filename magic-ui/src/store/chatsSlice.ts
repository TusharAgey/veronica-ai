import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatHistoryState } from "../services/types";

const initialState: ChatHistoryState = {
  sessions: {},
  messages: {},
  activeSessionId: null,
  searchQuery: "",
  panelOpen: false,
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,

  reducers: {
    /**
     * Create a new chat session for the given bot.
     * Generates a UUID, sets timestamps, initializes empty messages array.
     */
    createSession(
      state,
      action: PayloadAction<{
        bot: string;
        name?: string;
        id?: string;
      }>,
    ) {
      const { bot, name, id = crypto.randomUUID() } = action.payload;

      state.sessions[id] = {
        id,
        name: name ?? `Chat with ${bot}`,
        bot,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messageCount: 0,
        lastMessagePreview: "",
      };
      state.messages[id] = [];
      state.activeSessionId = id;
    },

    /**
     * Delete a session (meta + messages) from state.
     */
    deleteSession(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.sessions[id];
      delete state.messages[id];

      // If the deleted session was active, clear activeSessionId
      if (state.activeSessionId === id) {
        state.activeSessionId = null;
      }
    },

    /**
     * Rename a session — updates name + updatedAt.
     */
    renameSession(state, action: PayloadAction<{ id: string; name: string }>) {
      const { id, name } = action.payload;
      const session = state.sessions[id];
      if (session) {
        session.name = name;
        session.updatedAt = Date.now();
      }
    },

    /**
     * Switch the active session.
     */
    setActiveSession(state, action: PayloadAction<string | null>) {
      state.activeSessionId = action.payload;
    },

    /**
     * Toggle the history panel open/closed.
     */
    toggleHistoryPanel(state) {
      state.panelOpen = !state.panelOpen;
    },

    /**
     * Set the search query for filtering sessions.
     */
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },

    /**
     * Add a user prompt to the active session.
     * Updates messageCount, lastMessagePreview, updatedAt.
     */
    addUserPrompt(
      state,
      action: PayloadAction<{
        sessionId: string;
        user: string;
      }>,
    ) {
      const { sessionId, user } = action.payload;
      const session = state.sessions[sessionId];
      if (!session) return;

      if (!state.messages[sessionId]) {
        state.messages[sessionId] = [];
      }

      state.messages[sessionId].push({
        user,
        assistant: "",
      });

      session.messageCount += 1;
      session.lastMessagePreview =
        user.length > 60 ? user.slice(0, 57) + "..." : user;
      session.updatedAt = Date.now();
    },

    /**
     * Remove the last user prompt (used for cancellation).
     */
    removeLastUserPrompt(state, action: PayloadAction<{ sessionId: string }>) {
      const { sessionId } = action.payload;
      const messages = state.messages[sessionId];
      if (!messages?.length) return;

      const data = messages.pop();

      messages.push({
        user: data?.user ?? "",
        assistant: "User Cancelled this response...",
      });

      const session = state.sessions[sessionId];
      if (session) {
        session.updatedAt = Date.now();
      }
    },

    /**
     * Update the latest LLM response for the active session.
     */
    updateLatestLlmResponse(
      state,
      action: PayloadAction<{
        sessionId: string;
        assistant: string;
      }>,
    ) {
      const { sessionId, assistant } = action.payload;
      const messages = state.messages[sessionId];
      if (!messages?.length) return;

      messages[messages.length - 1].assistant = assistant;

      const session = state.sessions[sessionId];
      if (session) {
        session.updatedAt = Date.now();
      }
    },

    /**
     * Clear all messages in the active session (but keep the session meta).
     */
    clearChat(state, action: PayloadAction<string>) {
      const sessionId = action.payload;
      state.messages[sessionId] = [];

      const session = state.sessions[sessionId];
      if (session) {
        session.messageCount = 0;
        session.lastMessagePreview = "";
        session.updatedAt = Date.now();
      }
    },

    /**
     * Hydrate chat history from localStorage on app init.
     */
    hydrateChatHistory(_state, action: PayloadAction<ChatHistoryState>) {
      return action.payload;
    },
  },
});

export const {
  createSession,
  deleteSession,
  renameSession,
  setActiveSession,
  toggleHistoryPanel,
  setSearchQuery,
  addUserPrompt,
  removeLastUserPrompt,
  updateLatestLlmResponse,
  clearChat,
  hydrateChatHistory,
} = chatsSlice.actions;

export default chatsSlice.reducer;
