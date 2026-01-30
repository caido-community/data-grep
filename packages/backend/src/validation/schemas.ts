import { z } from "zod";

export const CustomRegexSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  regex: z
    .string()
    .min(1, "Regex pattern is required")
    .refine((pattern) => {
      try {
        new RegExp(pattern);
        return true;
      } catch {
        return false;
      }
    }, "Invalid regex pattern"),
  matchGroups: z.array(z.number().nonnegative()).optional(),
});

export const GrepOptionsSchema = z.object({
  includeRequests: z.boolean(),
  includeResponses: z.boolean(),
  maxResults: z.number().positive().nullable(),
  matchGroups: z.array(z.number().nonnegative()).nullable(),
  onlyInScope: z.boolean(),
  skipLargeResponses: z.boolean(),
  customHTTPQL: z.string().nullable(),
  cleanupOutput: z.boolean(),
  transformScript: z.string().nullable(),
});

export const RegexIdSchema = z
  .string()
  .min(1, "ID is required")
  .max(50, "ID must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "ID can only contain letters, numbers, underscores, and hyphens"
  );

export const GrepPatternSchema = z
  .string()
  .min(1, "Pattern is required")
  .refine((pattern) => {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }, "Invalid regex pattern");
