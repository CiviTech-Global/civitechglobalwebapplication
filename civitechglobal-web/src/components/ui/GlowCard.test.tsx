import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlowCard } from "./GlowCard";

describe("GlowCard", () => {
  it("renders children", () => {
    render(<GlowCard>Card content</GlowCard>);
    expect(screen.getByText(/card content/i)).toBeInTheDocument();
  });
});
