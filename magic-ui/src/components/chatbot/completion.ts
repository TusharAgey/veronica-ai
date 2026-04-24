import {
  SYSTEM,
  LLAMA_RESPONSE_TERMINATOR_CONTENT,
  LLAMA_SERVER_HOST_PORT,
} from "../../utilities/const";
import { optimizePayload } from "../../utilities/utils";
import type {
  ChatMessage,
  LlamaParams,
  LlamaChunk,
} from "../../services/types";

const paramDefaults: LlamaParams = {
  stream: true,
  n_predict: 1000,
  temperature: 0.7,
  repeat_last_n: 256,
  repeat_penalty: 1.18,
  top_k: 40,
  top_p: 0.9,
  min_p: 0.05,
  tfs_z: 1,
  typical_p: 1,
  presence_penalty: 0,
  frequency_penalty: 0,
  mirostat: 0,
  mirostat_tau: 5,
  mirostat_eta: 0.1,
  n_probs: 0,
  cache_prompt: false, // Stop caching of prompt to ensure faster response and less memory usage.
  slot_id: 0,
  max_tokens: 1000, // This is to limit the tokens generated from LLAMA to ensure less memory footprint.
};
let controller: AbortController | null = null;
export function stopGeneration() {
  controller?.abort();
}

// Backstory is a system prompt that sets tone/behavior.
export async function* llama(
  prompt: ChatMessage[],
  backstory: string,
  params: LlamaParams = {},
): AsyncGenerator<string, string, void> {
  if (!controller) {
    controller = new AbortController();
  }

  const finalPrompt: ChatMessage[] = [
    {
      role: SYSTEM,
      content: backstory,
    },
    ...optimizePayload(prompt),
  ];

  const completionParams = {
    ...paramDefaults,
    ...params,
    messages: finalPrompt,
  };

  const response = await fetch(
    `${LLAMA_SERVER_HOST_PORT}/v1/chat/completions`,
    {
      method: "POST",
      body: JSON.stringify(completionParams),
      headers: {
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      signal: controller.signal,
    },
  );

  if (!response.body) {
    throw new Error("Readable stream not available.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let content = "";

  try {
    let cont = true;
    let serverIncompleteResponse = false;
    let buffer = "";

    while (cont) {
      const result = await reader.read();

      if (result.done) {
        // stream ended while leftover unparsed payload exists
        if (buffer.trim()) {
          serverIncompleteResponse = true;
        }
        break;
      }

      buffer += decoder.decode(result.value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      // keep unfinished trailing event
      buffer = events.pop() ?? "";

      for (const rawEvent of events) {
        const event = rawEvent.trim();

        if (!event) {
          continue;
        }

        const dataLines = event
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.replace(/^data:\s*/, ""));

        const data = dataLines.join("\n").trim();

        if (!data) {
          continue;
        }

        if (
          data === LLAMA_RESPONSE_TERMINATOR_CONTENT.replace(/^data:\s*/, "")
        ) {
          cont = false;
          break;
        }

        try {
          const chunk: LlamaChunk = JSON.parse(data);

          const delta = chunk.choices?.[0]?.delta?.content;

          if (delta != null) {
            content += delta;
            yield delta;
          }
        } catch {
          // malformed complete event from server
          serverIncompleteResponse = true;
        }
      }
    }

    // optional final visibility
    if (serverIncompleteResponse) {
      console.warn("Server ended stream with incomplete response payload.");
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.error("llama error:", error);
    throw error;
  } finally {
    reader.releaseLock();
  }

  return content;
}
