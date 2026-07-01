import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { api, llama } from "../services/api";
import { llamaApi } from "../services/llamaApi";
import chatsReducer from "./chatsSlice";

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
