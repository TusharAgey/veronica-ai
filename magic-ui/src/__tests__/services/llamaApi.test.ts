import { describe, it, expect, vi, beforeEach } from "vitest";
import { llamaApi } from "../../services/llamaApi";

// Use vi.hoisted to avoid hoisting issues with vi.mock factory
const { mockLlamaGenerator } = vi.hoisted(() => ({
  mockLlamaGenerator: vi.fn(),
}));

vi.mock("../../components/chatbot/completion", () => ({
  llama: mockLlamaGenerator,
  stopGeneration: vi.fn(),
}));

describe("llamaApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has the correct reducerPath", () => {
    expect(llamaApi.reducerPath).toBe("llamaApi");
  });

  it("has endpoints defined", () => {
    expect(llamaApi.endpoints).toBeDefined();
  });

  it("has runLlama endpoint", () => {
    expect(llamaApi.endpoints.runLlama).toBeDefined();
  });

  it("runLlama endpoint has useLazyQuery hook", () => {
    const endpoint = llamaApi.endpoints.runLlama;
    expect(typeof (endpoint as any).useLazyQuery).toBe("function");
  });

  it("exports useLazyRunLlamaQuery hook", () => {
    const { useLazyRunLlamaQuery } = llamaApi;
    expect(typeof useLazyRunLlamaQuery).toBe("function");
  });
});
