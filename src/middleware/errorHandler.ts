import type { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

// Responds 404 for any route that didn't match
export const notFound = (req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Catches errors thrown in route handlers (Express 5 forwards rejected
// promises here) and responds with clean JSON instead of an HTML page.
export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // malformed JSON body from express.json()
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }

  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(status).json({
    message:
      status >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
