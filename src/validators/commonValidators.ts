import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("id must be a valid UUID"),
});

export type IdParams = z.infer<typeof idParamSchema>;

// query params arrive as strings, so coerce them to numbers first
export const paginationSchema = z.object({
  page: z.coerce
    .number({ error: "page must be a number" })
    .int("page must be a whole number")
    .min(1, "page must be 1 or greater")
    .default(1),
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be a whole number")
    .min(1, "limit must be between 1 and 100")
    .max(100, "limit must be between 1 and 100")
    .default(10),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
