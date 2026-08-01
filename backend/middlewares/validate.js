// middlewares/validate.js — Zod validation middleware
// Compatible with Zod v4 (uses err.issues, not err.errors which was removed in v4).

import { ZodError } from "zod";
import logger from "../utils/logger.js";

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On failure returns 400 with a structured list of field errors.
 *
 * @param {import("zod").ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  // Use safeParse so we always have a predictable result shape regardless of
  // how the ZodError is thrown (avoids any instanceof quirks in ESM).
  const result = schema.safeParse(req.body);

  if (result.success) {
    // Replace req.body with the coerced / defaulted data from Zod
    req.body = result.data;
    return next();
  }

  // result.error is a ZodError — in Zod v4 issues live on .issues (not .errors)
  const issues = result.error?.issues ?? [];

  const errors = issues.map((e) => ({
    field: e.path.join(".") || "(root)",
    message: e.message,
  }));

  logger.warn("Request validation failed", {
    path: req.path,
    errors,
  });

  return res.status(400).json({
    error: "Validation failed",
    details: errors,
  });
};
