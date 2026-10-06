import { z } from "zod";

const watchlistStatus = z.enum(
  ["PLANNED", "WATCHING", "COMPLETED", "DROPPED"],
  {
    error: "status must be one of PLANNED, WATCHING, COMPLETED, DROPPED",
  },
);

const rating = z
  .int("rating must be a whole number")
  .min(1, "rating must be between 1 and 10")
  .max(10, "rating must be between 1 and 10");

const notes = z.string().trim().max(1000);

export const addToWatchlistSchema = z.object({
  movieId: z.uuid("movieId must be a valid UUID"),
  status: watchlistStatus.optional(),
  rating: rating.optional(),
  notes: notes.optional(),
});

export const updateWatchlistItemSchema = z
  .object({
    status: watchlistStatus.optional(),
    rating: rating.optional(),
    notes: notes.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one of status, rating or notes",
  });

export type AddToWatchlistInput = z.infer<typeof addToWatchlistSchema>;
export type UpdateWatchlistItemInput = z.infer<
  typeof updateWatchlistItemSchema
>;
