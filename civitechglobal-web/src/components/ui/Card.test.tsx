import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });

  it("renders with hover enabled", () => {
    render(<Card hover>Hover card</Card>);
    expect(screen.getByText(/hover card/i)).toBeInTheDocument();
  });
});
