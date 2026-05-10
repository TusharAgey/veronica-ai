import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlassInput, GlassSelect } from "../../../components/ui/GlassInput";

describe("GlassInput", () => {
  it("renders an input element", () => {
    render(<GlassInput placeholder="Test input" />);
    expect(screen.getByPlaceholderText("Test input")).toBeInTheDocument();
  });

  it("passes through HTML input props", () => {
    render(
      <GlassInput
        type="password"
        placeholder="Password"
        required
        maxLength={10}
      />,
    );
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("applies custom className alongside glass styles", () => {
    const { container } = render(
      <GlassInput className="extra-class" placeholder="Test" />,
    );
    const input = container.querySelector("input");
    expect(input?.className).toContain("extra-class");
  });

  it("handles onChange events", () => {
    let value = "";
    render(
      <GlassInput
        placeholder="Test"
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    const input = screen.getByPlaceholderText("Test");
    fireEvent.change(input, { target: { value: "new value" } });
    expect(value).toBe("new value");
  });
});

describe("GlassSelect", () => {
  it("renders a select element with children", () => {
    render(
      <GlassSelect>
        <option>Option 1</option>
        <option>Option 2</option>
      </GlassSelect>,
    );
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("passes through select props", () => {
    render(
      <GlassSelect value="val1" onChange={() => {}}>
        <option value="val1">Value 1</option>
        <option value="val2">Value 2</option>
      </GlassSelect>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("val1");
  });
});
