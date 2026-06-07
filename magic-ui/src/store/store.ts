import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { api, llama } from "../services/api";
import { llamaApi } from "../services/llamaApi";
import chatsReducer from "./chatsSlice";
import { saveChatHistory } from "../utilities/utils";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [llama.reducerPath]: llama.reducer,
    [llamaApi.reducerPath]: llamaApi.reducer,
    chats: chatsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(llama.middleware)
      .concat(llamaApi.middleware),
});

// ─── Auto-save chat history to localStorage ──────────────────────────────────
// Debounced write on every state change to persist chat sessions.
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

store.subscribe(() => {
  const state = store.getState();
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveChatHistory(state.chats);
  }, 500); // 500ms debounce
});

/**
 * Root state type
 */
type RootState = ReturnType<typeof store.getState>;

/**
 * Dispatch type
 */
type AppDispatch = typeof store.dispatch;

/**
 * Typed dispatch hook
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed selector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
