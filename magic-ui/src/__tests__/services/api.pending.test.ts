import { describe, it, expect } from "vitest";

/**
 * PENDING TESTS for api.ts
 *
 * Current coverage: 54.54% statements, 28.57% functions
 * Uncovered lines: 22-37, 56 (getAccounts, getAccountDetails, createNewAccount, getActiveLLMModel)
 *
 * These tests require mocking fetchBaseQuery or using a mock server (MSW)
 * to test the RTK Query endpoint definitions.
 */
describe.todo("api - getAccounts query", () => {
  it.todo("should fetch accounts from /v2/password-manager/user/accounts");
  it.todo("should transform response to extract accounts array");
  it.todo("should provide Accounts tag");
});

describe.todo("api - getAccountDetails query", () => {
  it.todo("should fetch account details by name");
});

describe.todo("api - createNewAccount mutation", () => {
  it.todo("should POST to /v2/password-manager/new with account details");
  it.todo("should invalidate Accounts tag on success");
});

describe.todo("llama - getActiveLLMModel query", () => {
  it.todo("should fetch active model from /models endpoint");
});
