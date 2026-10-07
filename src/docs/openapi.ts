import { z, type ZodType } from "zod";

import { loginSchema, registerSchema } from "../validators/authValidators.ts";
import { paginationSchema } from "../validators/commonValidators.ts";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movieValidators.ts";
import {
  addToWatchlistSchema,
  updateWatchlistItemSchema,
} from "../validators/watchlistValidators.ts";

// Request bodies are generated from the zod validators, so the docs always
// match what the API actually accepts.
const fromZod = (schema: ZodType) => {
  const { $schema: _, ...jsonSchema } = z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
  });
  return jsonSchema;
};

const jsonBody = (schemaRef: string) => ({
  required: true,
  content: { "application/json": { schema: { $ref: schemaRef } } },
});

const jsonResponse = (description: string, schema?: object) => ({
  description,
  ...(schema && { content: { "application/json": { schema } } }),
});

const dataOf = (schema: object) => ({
  type: "object",
  properties: { message: { type: "string" }, data: schema },
});

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const idParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

// turns each field of a zod object schema into an OpenAPI query parameter
const queryParamsFromZod = (schema: ZodType) => {
  const { properties = {} } = fromZod(schema);
  return Object.entries(properties).map(([name, fieldSchema]) => ({
    name,
    in: "query",
    required: false,
    schema: fieldSchema,
  }));
};

const errors = {
  400: jsonResponse("Validation failed", ref("ValidationError")),
  401: jsonResponse("Missing or invalid token", ref("Error")),
  403: jsonResponse("Not the owner of this resource", ref("Error")),
  404: jsonResponse("Not found", ref("Error")),
};

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Movies List API",
    version: "1.0.0",
    description:
      "REST API for managing movies and personal watchlists. " +
      "Register or log in, then click **Authorize** and paste the returned token.",
  },
  servers: [{ url: "/" }],
  tags: [{ name: "Auth" }, { name: "Movies" }, { name: "Watchlist" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      RegisterInput: fromZod(registerSchema),
      LoginInput: fromZod(loginSchema),
      CreateMovieInput: fromZod(createMovieSchema),
      UpdateMovieInput: fromZod(updateMovieSchema),
      AddToWatchlistInput: fromZod(addToWatchlistSchema),
      UpdateWatchlistItemInput: fromZod(updateWatchlistItemSchema),
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: ["string", "null"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Movie: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          overview: { type: ["string", "null"] },
          releaseYear: { type: "integer" },
          genres: { type: "array", items: { type: "string" } },
          runtime: { type: ["integer", "null"] },
          posterUrl: { type: ["string", "null"] },
          createdBy: { type: "string", format: "uuid" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WatchlistItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          movieId: { type: "string", format: "uuid" },
          status: {
            type: "string",
            enum: ["PLANNED", "WATCHING", "COMPLETED", "DROPPED"],
          },
          rating: { type: ["integer", "null"] },
          notes: { type: ["string", "null"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          data: ref("User"),
          token: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 57 },
          totalPages: { type: "integer", example: 6 },
        },
      },
      Error: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      ValidationError: {
        type: "object",
        properties: {
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: jsonBody("#/components/schemas/RegisterInput"),
        responses: {
          201: jsonResponse("Registered", ref("AuthResponse")),
          400: jsonResponse("Validation failed or user exists", ref("Error")),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        requestBody: jsonBody("#/components/schemas/LoginInput"),
        responses: {
          200: jsonResponse("Logged in", ref("AuthResponse")),
          400: jsonResponse("Invalid email or password", ref("Error")),
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Clear the auth cookie",
        responses: { 200: jsonResponse("Logged out", ref("Error")) },
      },
    },
    "/movies": {
      get: {
        tags: ["Movies"],
        summary: "List movies, one page at a time",
        parameters: queryParamsFromZod(paginationSchema),
        responses: {
          200: jsonResponse("A page of movies, newest first", {
            type: "object",
            properties: {
              data: { type: "array", items: ref("Movie") },
              pagination: ref("Pagination"),
            },
          }),
          400: errors[400],
        },
      },
      post: {
        tags: ["Movies"],
        summary: "Create a movie",
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody("#/components/schemas/CreateMovieInput"),
        responses: {
          201: jsonResponse("Created", dataOf(ref("Movie"))),
          400: errors[400],
          401: errors[401],
        },
      },
    },
    "/movies/{id}": {
      parameters: [idParam],
      get: {
        tags: ["Movies"],
        summary: "Get a movie by id",
        responses: {
          200: jsonResponse("The movie", dataOf(ref("Movie"))),
          400: errors[400],
          404: errors[404],
        },
      },
      put: {
        tags: ["Movies"],
        summary: "Update a movie you created",
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody("#/components/schemas/UpdateMovieInput"),
        responses: {
          200: jsonResponse("Updated", dataOf(ref("Movie"))),
          ...errors,
        },
      },
      delete: {
        tags: ["Movies"],
        summary: "Delete a movie you created",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse("Deleted", ref("Error")),
          ...errors,
        },
      },
    },
    "/watchlist": {
      get: {
        tags: ["Watchlist"],
        summary: "Get your watchlist",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse(
            "Watchlist items with their movie",
            dataOf({ type: "array", items: ref("WatchlistItem") }),
          ),
          401: errors[401],
        },
      },
      post: {
        tags: ["Watchlist"],
        summary: "Add a movie to your watchlist",
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody("#/components/schemas/AddToWatchlistInput"),
        responses: {
          201: jsonResponse("Added", dataOf(ref("WatchlistItem"))),
          400: jsonResponse(
            "Validation failed or already in watchlist",
            ref("Error"),
          ),
          401: errors[401],
          404: jsonResponse("Movie not found", ref("Error")),
        },
      },
    },
    "/watchlist/{id}": {
      parameters: [idParam],
      put: {
        tags: ["Watchlist"],
        summary: "Update status, rating or notes",
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody("#/components/schemas/UpdateWatchlistItemInput"),
        responses: {
          200: jsonResponse("Updated", dataOf(ref("WatchlistItem"))),
          ...errors,
        },
      },
      delete: {
        tags: ["Watchlist"],
        summary: "Remove a movie from your watchlist",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse("Removed", ref("Error")),
          ...errors,
        },
      },
    },
  },
};
