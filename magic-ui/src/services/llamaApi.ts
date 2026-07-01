import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ChatMessage } from "./types";
import { llama } from "../components/chatbot/completion";

export interface RunLlamaRequest {
  prompt: ChatMessage[];
  backstory: string;
}

export interface RunLlamaResponse {
  content: string;
  streaming: boolean;
  serverIncompleteResponse: boolean;
}

export const llamaApi = createApi({
  reducerPath: "llamaApi",
  baseQuery: fakeBaseQuery(),

  endpoints: (builder) => ({
    runLlama: builder.query<RunLlamaResponse, RunLlamaRequest>({
      async queryFn() {
        return {
          data: {
            content: "",
            streaming: true,
            serverIncompleteResponse: false,
          },
        };
      },

      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        await cacheDataLoaded;

        try {
          for await (const chunk of llama(args.prompt, args.backstory)) {
            updateCachedData((draft) => {
              draft.content += chunk;
              draft.streaming = true;
            });
          }

          updateCachedData((draft) => {
            draft.streaming = false;
          });
        } catch {
          updateCachedData((draft) => {
            draft.streaming = false;
            draft.serverIncompleteResponse = true;
          });
        }

        await cacheEntryRemoved;
      },
    }),
  }),
});

export const { useLazyRunLlamaQuery } = llamaApi;
