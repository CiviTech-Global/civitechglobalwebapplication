import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders label and input", () => {
    render(
      <Input label="Email" value="test@example.com" onChange={() => {}} />,
    );
    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  });

  it("shows error message", () => {
    render(
      <Input label="Name" value="" onChange={() => {}} error="Required" />,
    );
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
