import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopHeader } from "../../../components/layout/TopHeader";

describe("TopHeader", () => {
  it("shows title based on activeTab", () => {
    render(
      <TopHeader
        activeTab="dashboard"
        theme="dark"
        onOpenSettings={() => {}}
      />,
    );
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("shows 'Password Manager' for passwords tab", () => {
    render(
      <TopHeader
        activeTab="passwords"
        theme="dark"
        onOpenSettings={() => {}}
      />,
    );
    expect(screen.getByText("Password Manager")).toBeInTheDocument();
  });

  it("shows greeting text", () => {
    render(
      <TopHeader
        activeTab="dashboard"
        theme="dark"
        onOpenSettings={() => {}}
      />,
    );
    expect(screen.getByText(/Good/)).toBeInTheDocument();
  });

  it("does not show title when activeTab is chatbot", () => {
    render(
      <TopHeader activeTab="chatbot" theme="dark" onOpenSettings={() => {}} />,
    );
    expect(screen.queryByText("chatbot")).not.toBeInTheDocument();
  });

  it("calls onOpenSettings when settings button is clicked", () => {
    const onOpenSettings = vi.fn();
    render(
      <TopHeader
        activeTab="dashboard"
        theme="dark"
        onOpenSettings={onOpenSettings}
      />,
    );
    const settingsButton = screen.getByRole("button");
    settingsButton.click();
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
