import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  it("renders options", () => {
    render(
      <Select
        label="Priority"
        options={[
          { value: "low", label: "Low" },
          { value: "high", label: "High" },
        ]}
        value="low"
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText(/priority/i)).toHaveValue("low");
    expect(screen.getByRole("option", { name: /high/i })).toBeInTheDocument();
  });
});
