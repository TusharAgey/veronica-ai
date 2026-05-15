import { describe, it, expect } from "vitest";
import {
  botPersonality,
  pwdManagerFields,
  USER,
  ASSISTANT,
  SYSTEM,
  LLAMA_RESPONSE_TERMINATOR_CONTENT,
  LLAMA_SERVER_HOST_PORT,
  PYTHON_SERVER_HOST_PORT,
} from "../../utilities/const";

describe("constants", () => {
  describe("botPersonality", () => {
    it("contains all 3 bots", () => {
      expect(botPersonality).toHaveProperty("Code Bot");
      expect(botPersonality).toHaveProperty("Space Pirate");
      expect(botPersonality).toHaveProperty("Dizzy");
    });

    it("Code Bot personality mentions code and programming", () => {
      expect(botPersonality["Code Bot"]).toContain("code");
      expect(botPersonality["Code Bot"]).toContain("Javascript");
    });

    it("Space Pirate personality mentions space and pirate slang", () => {
      const sp = botPersonality["Space Pirate"];
      expect(sp).toContain("Space Pirate");
      expect(sp).toContain("matey");
      expect(sp).toContain("Orion");
    });

    it("Dizzy personality is child-friendly and short", () => {
      const dizzy = botPersonality["Dizzy"];
      expect(dizzy).toContain("baby");
      expect(dizzy).toContain("Dizzy");
      expect(dizzy).toContain("Happy");
    });
  });

  describe("pwdManagerFields", () => {
    it("has exactly 6 fields", () => {
      expect(pwdManagerFields).toHaveLength(6);
    });

    it("includes all required field identifiers", () => {
      const identifiers = pwdManagerFields.map((f) => f.fieldIdentifier);
      expect(identifiers).toContain("account-name");
      expect(identifiers).toContain("user-name");
      expect(identifiers).toContain("email-id");
      expect(identifiers).toContain("password");
      expect(identifiers).toContain("account-description");
      expect(identifiers).toContain("session-password");
    });

    it("each field has the correct shape", () => {
      for (const field of pwdManagerFields) {
        expect(field).toHaveProperty("fieldLabel");
        expect(field).toHaveProperty("fieldIdentifier");
        expect(field).toHaveProperty("fieldType");
        expect(field).toHaveProperty("placeholder");
      }
    });
  });

  describe("role constants", () => {
    it("USER is 'user'", () => expect(USER).toBe("user"));
    it("ASSISTANT is 'assistant'", () => expect(ASSISTANT).toBe("assistant"));
    it("SYSTEM is 'system'", () => expect(SYSTEM).toBe("system"));
  });

  describe("LLAMA_RESPONSE_TERMINATOR_CONTENT", () => {
    it("is the SSE done marker", () => {
      expect(LLAMA_RESPONSE_TERMINATOR_CONTENT).toBe("data: [DONE]");
    });
  });

  describe("server host/port constants", () => {
    it("LLAMA_SERVER_HOST_PORT is '/llama'", () => {
      expect(LLAMA_SERVER_HOST_PORT).toBe("/llama");
    });
    it("PYTHON_SERVER_HOST_PORT is '/api'", () => {
      expect(PYTHON_SERVER_HOST_PORT).toBe("/api");
    });
  });
});
