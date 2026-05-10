import { describe, it, expect } from "vitest";
import { llamaApi } from "../../services/llamaApi";

describe("llamaApi", () => {
  it("has the correct reducerPath", () => {
    expect(llamaApi.reducerPath).toBe("llamaApi");
  });

  it("has endpoints defined", () => {
    expect(llamaApi.endpoints).toBeDefined();
  });
});
