import { describe, it, expect } from "vitest";
import { api, llama } from "../../services/api";

describe("RTK Query API services", () => {
  describe("api (password manager)", () => {
    it("has the correct reducerPath", () => {
      expect(api.reducerPath).toBe("api");
    });

    it("has endpoints defined", () => {
      expect(api.endpoints).toBeDefined();
    });
  });

  describe("llama (chat)", () => {
    it("has the correct reducerPath", () => {
      expect(llama.reducerPath).toBe("llama");
    });

    it("has endpoints defined", () => {
      expect(llama.endpoints).toBeDefined();
    });
  });
});
