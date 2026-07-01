import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ZapBackdrop } from "../../../components/chatbot/Zap";

describe("ZapBackdrop", () => {
  it("renders the background image", () => {
    const { container } = render(<ZapBackdrop />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toBeTruthy();
  });

  it("has pointer-events-none class", () => {
    const { container } = render(<ZapBackdrop />);
    const div = container.firstElementChild;
    expect(div?.className).toContain("pointer-events-none");
  });
});
