import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MainGlassPanel } from "../../../components/layout/MainGlassPanel";

describe("MainGlassPanel", () => {
  it("renders children", () => {
    render(
      <MainGlassPanel theme="dark" blurValue={5}>
        <div data-testid="child">Content</div>
      </MainGlassPanel>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies blurValue to backdrop-filter style", () => {
    const { container } = render(
      <MainGlassPanel theme="dark" blurValue={8}>
        Content
      </MainGlassPanel>,
    );
    const main = container.querySelector("main");
    expect(main?.style.backdropFilter).toContain("blur(8px)");
  });

  it("applies different theme classes", () => {
    const { container: darkContainer } = render(
      <MainGlassPanel theme="dark" blurValue={5}>
        Dark
      </MainGlassPanel>,
    );
    const { container: midnightContainer } = render(
      <MainGlassPanel theme="midnight" blurValue={5}>
        Midnight
      </MainGlassPanel>,
    );

    const darkMain = darkContainer.querySelector("main");
    const midnightMain = midnightContainer.querySelector("main");

    // Different themes should have different class combinations
    expect(darkMain?.className).not.toBe(midnightMain?.className);
  });
});
