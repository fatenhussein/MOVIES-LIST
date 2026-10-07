import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Validates req.body, req.params or req.query against a zod schema.
// On failure responds 400 with a list of field errors.
export const validateRequest =
  (schema: ZodType, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // replace the body with the parsed data (trimmed strings, unknown keys removed)
    if (source === "body") {
      req.body = result.data;
    }

    // in Express 5 req.query is a getter and can't be assigned,
    // so redefine it with the parsed data (numbers, defaults applied)
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        enumerable: true,
      });
    }

    next();
  };

export default validateRequest;
