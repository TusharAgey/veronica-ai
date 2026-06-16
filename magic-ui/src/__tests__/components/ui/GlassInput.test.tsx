import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  GlassInput,
  GlassSelect,
  GlassSearchableSelect,
} from "../../../components/ui/GlassInput";

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

describe("GlassSearchableSelect", () => {
  const defaultOptions = [
    "Gmail",
    "Outlook",
    "GitHub",
    "GitLab",
    "Slack",
    "Discord",
  ];

  it("renders the trigger button with placeholder text when no value is selected", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Select account...")).toBeInTheDocument();
  });

  it("renders the trigger button with the selected value", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value="GitHub"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders a custom placeholder when provided", () => {
    render(
      <GlassSearchableSelect
        placeholder="Pick one..."
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Pick one...")).toBeInTheDocument();
  });

  it("opens the dropdown when the trigger button is clicked", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );
    const trigger = screen.getByText("Select account...");
    fireEvent.click(trigger);

    // Dropdown should now be visible with search input and options
    expect(
      screen.getByPlaceholderText("Search accounts..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Gmail")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <GlassSearchableSelect
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      </div>,
    );

    // Open the dropdown
    fireEvent.click(screen.getByText("Select account..."));
    expect(
      screen.getByPlaceholderText("Search accounts..."),
    ).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(
      screen.queryByPlaceholderText("Search accounts..."),
    ).not.toBeInTheDocument();
  });

  it("calls onChange and closes dropdown when an option is selected", () => {
    const handleChange = vi.fn();
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={handleChange}
      />,
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Select account..."));
    // Select "GitHub"
    fireEvent.click(screen.getByText("GitHub"));

    expect(handleChange).toHaveBeenCalledWith("GitHub");
    // Dropdown should be closed
    expect(
      screen.queryByPlaceholderText("Search accounts..."),
    ).not.toBeInTheDocument();
  });

  it("filters options based on search input", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Select account..."));

    // Type in search
    const searchInput = screen.getByPlaceholderText("Search accounts...");
    fireEvent.change(searchInput, { target: { value: "Git" } });

    // Should show GitHub and GitLab, but not Gmail or Slack
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("GitLab")).toBeInTheDocument();
    expect(screen.queryByText("Gmail")).not.toBeInTheDocument();
    expect(screen.queryByText("Slack")).not.toBeInTheDocument();
  });

  it("shows 'No accounts found' when search yields no results", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );

    // Open dropdown
    fireEvent.click(screen.getByText("Select account..."));

    // Type a search that matches nothing
    const searchInput = screen.getByPlaceholderText("Search accounts...");
    fireEvent.change(searchInput, { target: { value: "zzzzz" } });

    expect(screen.getByText("No accounts found")).toBeInTheDocument();
  });

  it("highlights the currently selected option in the dropdown", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value="GitHub"
        onChange={() => {}}
      />,
    );

    // Open dropdown
    fireEvent.click(screen.getByText("GitHub"));

    // The selected option should have the indigo styling class
    // Use getAllByText since "GitHub" appears in both the trigger and the dropdown
    const gitHubOptions = screen.getAllByText("GitHub");
    // The dropdown option is the second one (index 1)
    const dropdownOption = gitHubOptions[1];
    expect(dropdownOption.className).toContain("text-indigo-400");
    expect(dropdownOption.className).toContain("bg-indigo-500/20");
  });

  it("resets search text when dropdown closes after selection", () => {
    const handleChange = vi.fn();
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={handleChange}
      />,
    );

    // Open dropdown and type a search
    fireEvent.click(screen.getByText("Select account..."));
    const searchInput = screen.getByPlaceholderText("Search accounts...");
    fireEvent.change(searchInput, { target: { value: "Git" } });

    // Select an option
    fireEvent.click(screen.getByText("GitHub"));

    // onChange was called, but value prop is still "" (parent didn't update),
    // so the trigger shows the placeholder again
    expect(handleChange).toHaveBeenCalledWith("GitHub");

    // Re-open dropdown - search should be reset
    fireEvent.click(screen.getByText("Select account..."));
    const reopenedSearch = screen.getByPlaceholderText("Search accounts...");
    expect(reopenedSearch).toHaveValue("");
  });

  it("resets search text when dropdown closes via outside click", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <GlassSearchableSelect
          options={defaultOptions}
          value=""
          onChange={() => {}}
        />
      </div>,
    );

    // Open dropdown and type a search
    fireEvent.click(screen.getByText("Select account..."));
    const searchInput = screen.getByPlaceholderText("Search accounts...");
    fireEvent.change(searchInput, { target: { value: "Git" } });

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));

    // Re-open dropdown - search should be reset
    fireEvent.click(screen.getByText("Select account..."));
    const reopenedSearch = screen.getByPlaceholderText("Search accounts...");
    expect(reopenedSearch).toHaveValue("");
  });

  it("applies custom className to the container", () => {
    const { container } = render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
        className="my-custom-class"
      />,
    );
    // The container div should have the custom class
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv.className).toContain("my-custom-class");
  });

  it("toggles dropdown open/close on repeated clicks", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );

    const trigger = screen.getByText("Select account...");

    // First click opens
    fireEvent.click(trigger);
    expect(
      screen.getByPlaceholderText("Search accounts..."),
    ).toBeInTheDocument();

    // Second click closes
    fireEvent.click(trigger);
    expect(
      screen.queryByPlaceholderText("Search accounts..."),
    ).not.toBeInTheDocument();
  });

  it("focuses the search input when dropdown opens", () => {
    render(
      <GlassSearchableSelect
        options={defaultOptions}
        value=""
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("Select account..."));
    const searchInput = screen.getByPlaceholderText("Search accounts...");
    expect(document.activeElement).toBe(searchInput);
  });
});
