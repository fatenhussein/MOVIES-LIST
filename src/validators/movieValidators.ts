import { z } from "zod";

const currentYear = new Date().getFullYear();

const movieFields = {
  title: z
    .string({ error: "title is required" })
    .trim()
    .min(1, "title is required")
    .max(200),
  overview: z.string().trim().max(2000).optional(),
  releaseYear: z
    .int("releaseYear must be a whole number")
    .min(1888, "releaseYear must be 1888 or later")
    .max(
      currentYear + 10,
      `releaseYear must be ${currentYear + 10} or earlier`,
    ),
  genres: z.array(z.string().trim().min(1)).optional(),
  runtime: z.int("runtime must be a whole number").positive().optional(),
  posterUrl: z.url("posterUrl must be a valid URL").optional(),
};

export const createMovieSchema = z.object(movieFields);

export const updateMovieSchema = z
  .object(movieFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
