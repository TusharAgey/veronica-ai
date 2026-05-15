import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  laodRandomFile,
  loadLlamaModelDetails,
  getKokoroAudio,
} from "../../utilities/apiCalls";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("apiCalls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("laodRandomFile", () => {
    it("calls axios.get with the correct endpoint", async () => {
      mockedAxios.get.mockResolvedValue({ data: "file content" });
      await laodRandomFile();
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/treeTraversal.java");
    });

    it("returns the response data", async () => {
      const mockResponse = { data: "public class TreeTraversal {}" };
      mockedAxios.get.mockResolvedValue(mockResponse);
      const result = await laodRandomFile();
      expect(result.data).toBe("public class TreeTraversal {}");
    });
  });

  describe("loadLlamaModelDetails", () => {
    it("calls axios.get with the /models endpoint", async () => {
      mockedAxios.get.mockResolvedValue({ data: { models: [] } });
      await loadLlamaModelDetails();
      expect(mockedAxios.get).toHaveBeenCalledWith("/llama/models");
    });
  });

  describe("getKokoroAudio", () => {
    it("sends a POST request with correct URL, body, and headers", async () => {
      const mockBlob = new Blob(["audio data"], { type: "audio/wav" });
      mockedAxios.post.mockResolvedValue({ data: mockBlob });

      await getKokoroAudio("Hello world");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/generate-tts",
        {
          text: "Hello world",
          voice: "af_heart",
        },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        },
      );
    });

    it("returns the audio blob response", async () => {
      const mockBlob = new Blob(["audio data"], { type: "audio/wav" });
      mockedAxios.post.mockResolvedValue({ data: mockBlob });

      const result = await getKokoroAudio("Test");
      expect(result.data).toBeInstanceOf(Blob);
    });
  });
});
