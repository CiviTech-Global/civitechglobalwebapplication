import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("renders label and value", () => {
    render(<TextArea label="Description" value="Hello" onChange={() => {}} />);
    expect(screen.getByLabelText(/description/i)).toHaveValue("Hello");
  });

  it("shows error message", () => {
    render(
      <TextArea label="Note" value="" onChange={() => {}} error="Too short" />,
    );
    expect(screen.getByText(/too short/i)).toBeInTheDocument();
  });
});
