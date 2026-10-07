import { describe, expect, it } from "vitest";

import { registerSchema } from "../src/validators/authValidators.ts";
import { paginationSchema } from "../src/validators/commonValidators.ts";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../src/validators/movieValidators.ts";
import { updateWatchlistItemSchema } from "../src/validators/watchlistValidators.ts";

describe("paginationSchema", () => {
  it("defaults to page 1 and limit 10", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 10 });
  });

  it("coerces query strings to numbers", () => {
    expect(paginationSchema.parse({ page: "2", limit: "3" })).toEqual({
      page: 2,
      limit: 3,
    });
  });

  it.each([
    ["page", "0"],
    ["page", "1.5"],
    ["page", "abc"],
    ["limit", "0"],
    ["limit", "101"],
  ])("rejects %s=%s", (field, value) => {
    expect(paginationSchema.safeParse({ [field]: value }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("trims and lowercases the email", () => {
    const result = registerSchema.parse({
      email: "  Faten@Example.COM ",
      password: "secret123",
    });
    expect(result.email).toBe("faten@example.com");
  });

  it("rejects passwords shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      email: "a@b.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createMovieSchema", () => {
  const valid = { title: "Inception", releaseYear: 2010 };

  it("accepts a minimal movie", () => {
    expect(createMovieSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a release year before 1888", () => {
    const result = createMovieSchema.safeParse({ ...valid, releaseYear: 1800 });
    expect(result.success).toBe(false);
  });

  it("strips unknown fields", () => {
    const result = createMovieSchema.parse({ ...valid, createdBy: "hacker" });
    expect(result).not.toHaveProperty("createdBy");
  });
});

describe("update schemas", () => {
  it("require at least one field", () => {
    expect(updateMovieSchema.safeParse({}).success).toBe(false);
    expect(updateWatchlistItemSchema.safeParse({}).success).toBe(false);
  });

  it("reject a rating outside 1-10", () => {
    expect(updateWatchlistItemSchema.safeParse({ rating: 11 }).success).toBe(
      false,
    );
  });
});
