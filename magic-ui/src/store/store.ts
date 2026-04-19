import { configureStore } from "@reduxjs/toolkit";
import { api, llama } from "../services/api";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [llama.reducerPath]: llama.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(llama.middleware),
});
