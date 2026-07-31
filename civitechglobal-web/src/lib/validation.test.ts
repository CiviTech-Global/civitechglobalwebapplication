import { describe, it, expect } from "vitest";
import {
  requiredString,
  emailSchema,
  passwordSchema,
  slugSchema,
  urlSchema,
  positiveNumberSchema,
  featureListSchema,
} from "./validation";

describe("validation helpers", () => {
  it("requiredString rejects empty values", () => {
    expect(requiredString().safeParse("").success).toBe(false);
    expect(requiredString().safeParse("hello").success).toBe(true);
  });

  it("emailSchema validates email format", () => {
    expect(emailSchema().safeParse("").success).toBe(false);
    expect(emailSchema().safeParse("invalid").success).toBe(false);
    expect(emailSchema().safeParse("user@example.com").success).toBe(true);
  });

  it("passwordSchema enforces complexity rules", () => {
    expect(passwordSchema().safeParse("short").success).toBe(false);
    expect(passwordSchema().safeParse("onlylowercase").success).toBe(false);
    expect(passwordSchema().safeParse("Password123").success).toBe(false);
    expect(passwordSchema().safeParse("Password123!").success).toBe(true);
  });

  it("slugSchema validates slug format", () => {
    expect(slugSchema().safeParse("").success).toBe(false);
    expect(slugSchema().safeParse("Invalid Slug").success).toBe(false);
    expect(slugSchema().safeParse("valid-slug-123").success).toBe(true);
  });

  it("urlSchema allows empty or valid URL", () => {
    expect(urlSchema().safeParse("").success).toBe(true);
    expect(urlSchema().safeParse("not-a-url").success).toBe(false);
    expect(urlSchema().safeParse("https://example.com").success).toBe(true);
  });

  it("positiveNumberSchema allows empty or positive numbers", () => {
    expect(positiveNumberSchema().safeParse("").success).toBe(true);
    expect(positiveNumberSchema().safeParse("-5").success).toBe(false);
    expect(positiveNumberSchema().safeParse("10").success).toBe(true);
    expect(positiveNumberSchema().safeParse("10.5").success).toBe(true);
  });

  it("featureListSchema splits comma separated values", () => {
    expect(featureListSchema().parse("")).toEqual([]);
    expect(featureListSchema().parse("a, b, c")).toEqual(["a", "b", "c"]);
    expect(featureListSchema().parse("one,two,,three")).toEqual([
      "one",
      "two",
      "three",
    ]);
  });
});
