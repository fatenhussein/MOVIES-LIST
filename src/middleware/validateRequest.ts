// Validates req.body or req.params against a zod schema.
// On failure responds 400 with a list of field errors.
export const validateRequest =
  (schema, source = "body") =>
  (req, res, next) => {
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

    next();
  };

export default validateRequest;
