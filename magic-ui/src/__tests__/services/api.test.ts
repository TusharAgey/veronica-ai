import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, llama } from "../../services/api";

// Mock fetch to test RTK Query endpoint definitions
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("RTK Query API services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("api (password manager)", () => {
    it("has the correct reducerPath", () => {
      expect(api.reducerPath).toBe("api");
    });

    it("has endpoints defined", () => {
      expect(api.endpoints).toBeDefined();
    });

    it("getAccounts endpoint is defined", () => {
      const endpoint = api.endpoints.getAccounts;
      expect(endpoint).toBeDefined();
      expect(typeof (endpoint as any).useQuery).toBe("function");
    });

    it("getAccountDetails endpoint is defined", () => {
      const endpoint = api.endpoints.getAccountDetails;
      expect(endpoint).toBeDefined();
      expect(typeof (endpoint as any).useQuery).toBe("function");
    });

    it("createNewAccount endpoint is defined", () => {
      const endpoint = api.endpoints.createNewAccount;
      expect(endpoint).toBeDefined();
      expect(typeof (endpoint as any).useMutation).toBe("function");
    });

    it("exports useGetAccountsQuery hook", () => {
      const { useGetAccountsQuery } = api;
      expect(typeof useGetAccountsQuery).toBe("function");
    });

    it("exports useGetAccountDetailsQuery hook", () => {
      const { useGetAccountDetailsQuery } = api;
      expect(typeof useGetAccountDetailsQuery).toBe("function");
    });

    it("exports useCreateNewAccountMutation hook", () => {
      const { useCreateNewAccountMutation } = api;
      expect(typeof useCreateNewAccountMutation).toBe("function");
    });
  });

  describe("llama (chat)", () => {
    it("has the correct reducerPath", () => {
      expect(llama.reducerPath).toBe("llama");
    });

    it("has endpoints defined", () => {
      expect(llama.endpoints).toBeDefined();
    });

    it("getActiveLLMModel endpoint is defined", () => {
      const endpoint = llama.endpoints.getActiveLLMModel;
      expect(endpoint).toBeDefined();
      expect(typeof (endpoint as any).useQuery).toBe("function");
    });

    it("exports useGetActiveLLMModelQuery hook", () => {
      const { useGetActiveLLMModelQuery } = llama;
      expect(typeof useGetActiveLLMModelQuery).toBe("function");
    });
  });
});
