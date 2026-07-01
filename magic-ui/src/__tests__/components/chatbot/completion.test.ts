import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { llama, stopGeneration } from "../../../components/chatbot/completion";
import type { ChatMessage } from "../../../services/types";

// Mock the fetch API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper to create a readable stream from chunks
function createStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

describe("completion.ts - llama()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    stopGeneration();
  });

  it("yields content chunks from SSE stream", async () => {
    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      "data: [DONE]\n\n",
    ];

    mockFetch.mockResolvedValue({
      body: createStream(sseChunks),
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hi" }];
    const collected: string[] = [];

    for await (const chunk of llama(prompt, "You are a bot")) {
      collected.push(chunk);
    }

    expect(collected).toEqual(["Hello", " world"]);
  });

  it("handles empty delta content gracefully", async () => {
    const sseChunks = [
      'data: {"choices":[{"delta":{}}]}\n\n',
      "data: [DONE]\n\n",
    ];

    mockFetch.mockResolvedValue({
      body: createStream(sseChunks),
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hi" }];
    const collected: string[] = [];

    for await (const chunk of llama(prompt, "You are a bot")) {
      collected.push(chunk);
    }

    expect(collected).toEqual([]);
  });

  it("throws when response body is not available", async () => {
    mockFetch.mockResolvedValue({
      body: null,
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hi" }];

    await expect(llama(prompt, "You are a bot").next()).rejects.toThrow(
      "Readable stream not available.",
    );
  });

  it("handles malformed JSON gracefully (logs warning, continues)", async () => {
    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"Good"}}]}\n\n',
      "data: {invalid json}\n\n",
      "data: [DONE]\n\n",
    ];

    mockFetch.mockResolvedValue({
      body: createStream(sseChunks),
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hi" }];
    const collected: string[] = [];

    // Should not throw; malformed event is skipped
    for await (const chunk of llama(prompt, "You are a bot")) {
      collected.push(chunk);
    }

    expect(collected).toEqual(["Good"]);
  });

  it("sends the correct request to the LLM server", async () => {
    const sseChunks = ["data: [DONE]\n\n"];

    mockFetch.mockResolvedValue({
      body: createStream(sseChunks),
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hello" }];
    const generator = llama(prompt, "Be helpful");
    await generator.next();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("/llama/v1/chat/completions");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(options.body);
    expect(body.messages).toBeDefined();
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toBe("Be helpful");
    expect(body.stream).toBe(true);
  });

  it("stopGeneration aborts the request", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");

    const sseChunks = ['data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'];

    mockFetch.mockResolvedValue({
      body: createStream(sseChunks),
      ok: true,
    });

    const prompt: ChatMessage[] = [{ role: "user", content: "Hi" }];
    const generator = llama(prompt, "Bot");

    // Start consuming
    const first = await generator.next();
    expect(first.value).toBe("Hello");

    // Abort
    stopGeneration();
    expect(abortSpy).toHaveBeenCalled();

    abortSpy.mockRestore();
  });
});
