import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges tailwind classes correctly", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    const shouldHide = false;
    expect(cn("base", shouldHide && "hidden", null, undefined, "block")).toBe(
      "base block",
    );
  });
});
