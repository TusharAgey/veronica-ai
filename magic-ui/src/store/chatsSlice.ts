import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatsState } from "../services/types";

const initialState: ChatsState = {
  sessions: {
    "Code Bot": [],
    "Space Pirate": [],
    Dizzy: [],
  },
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,

  reducers: {
    addUserPrompt(
      state,
      action: PayloadAction<{
        bot: string;
        user: string;
      }>,
    ) {
      const { bot, user } = action.payload;

      if (!state.sessions[bot]) {
        state.sessions[bot] = [];
      }

      state.sessions[bot].push({
        user,
        assistant: "",
      });
    },
    removeLastUserPrompt(
      state,
      action: PayloadAction<{
        bot: string;
      }>,
    ) {
      const data = state.sessions[action.payload.bot].pop();

      state.sessions[action.payload.bot].push({
        user: data?.user ?? "",
        assistant: "User Cancelled this response...",
      });
    },
    updateLatestLlmResponse(
      state,
      action: PayloadAction<{
        bot: string;
        assistant: string;
      }>,
    ) {
      const { bot, assistant } = action.payload;

      const session = state.sessions[bot];

      if (!session?.length) return;

      session[session.length - 1].assistant = assistant;
    },

    clearChat(state, action: PayloadAction<string>) {
      state.sessions[action.payload] = [];
    },
  },
});

export const {
  addUserPrompt,
  updateLatestLlmResponse,
  clearChat,
  removeLastUserPrompt,
} = chatsSlice.actions;

export default chatsSlice.reducer;
