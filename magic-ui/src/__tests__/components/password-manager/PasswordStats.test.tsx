import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStats } from "../../../components/password-manager/PasswordStats";

describe("PasswordStats", () => {
  it("displays the count prop", () => {
    render(<PasswordStats count={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows 'Total Saved' label", () => {
    render(<PasswordStats count={5} />);
    expect(screen.getByText("Total Saved")).toBeInTheDocument();
  });

  it("displays zero correctly", () => {
    render(<PasswordStats count={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
