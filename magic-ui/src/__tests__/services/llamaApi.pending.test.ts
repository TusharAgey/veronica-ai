import { describe, it, expect } from "vitest";

/**
 * PENDING TESTS for llamaApi.ts
 *
 * Current coverage: 18.75% statements, 16.66% functions
 * Uncovered lines: 23-56 (onCacheEntryAdded with streaming logic)
 *
 * These tests require mocking the `llama` async generator from completion.ts
 * and testing the RTK Query onCacheEntryAdded lifecycle.
 */
describe.todo("llamaApi - runLlama query", () => {
  it.todo("should return initial streaming response from queryFn");
  it.todo("should accumulate content chunks via onCacheEntryAdded");
  it.todo("should set streaming=false when stream completes");
  it.todo("should set serverIncompleteResponse=true on stream error");
  it.todo("should handle cacheEntryRemoved cleanup");
});
