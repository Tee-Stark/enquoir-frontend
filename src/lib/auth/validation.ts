import { z } from "zod";

/** Mirrors the backend's policy exactly (api/openapi.yaml SignUpRequest/ResetPasswordRequest). */
export const passwordSchema = z
  .string()
  .min(12, "Must be at least 12 characters.")
  .max(128, "Must be at most 128 characters.")
  .refine((value) => value.trim().length > 0, "Can't be only whitespace.");

export const emailSchema = z
  .string()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address.");
