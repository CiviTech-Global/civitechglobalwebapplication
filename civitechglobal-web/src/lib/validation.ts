import { z } from "zod";

export const requiredString = (message = "This field is required") =>
  z.string().min(1, message);

export const optionalString = () => z.string().optional();

export const emailSchema = (message = "Please enter a valid email") =>
  requiredString(message).email(message);

export const passwordSchema = (
  minMessage = "Password must be at least 12 characters",
  complexityMessage = "Password must include uppercase, lowercase, number, and special character",
) =>
  requiredString(minMessage)
    .min(12, minMessage)
    .max(128, "Password must be less than 128 characters")
    .regex(/[a-z]/, complexityMessage)
    .regex(/[A-Z]/, complexityMessage)
    .regex(/[0-9]/, complexityMessage)
    .regex(/[^a-zA-Z0-9]/, complexityMessage);

export const slugSchema = (
  message = "Slug must contain only lowercase letters, numbers, and hyphens",
) => requiredString(message).regex(/^[a-z0-9-]+$/, message);

export const urlSchema = (message = "Please enter a valid URL") =>
  z.union([z.literal(""), z.string().url(message)]);

export const positiveNumberSchema = (
  invalidMessage = "Please enter a valid number",
) =>
  z.union([z.literal(""), z.string().regex(/^\d+(\.\d+)?$/, invalidMessage)]);

export const featureListSchema = () =>
  z.string().transform((val) =>
    val
      ? val
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  );

export type ValidationMessages = {
  required?: string;
  email?: string;
  password?: {
    min?: string;
    complexity?: string;
  };
  slug?: string;
  url?: string;
  positiveNumber?: string;
};
