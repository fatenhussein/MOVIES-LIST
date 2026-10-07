import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../src/app.ts";

// These requests are all rejected before any database query runs,
// so the suite needs no database

describe("health and errors", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("unknown routes return a JSON 404", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });

  it("malformed JSON returns a 400, not a crash", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Malformed JSON in request body" });
  });
});

describe("validation", () => {
  it("POST /auth/register lists every invalid field", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "not-an-email", password: "123" });
    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["email", "password"]));
  });

  it("GET /movies rejects a limit over 100", async () => {
    const res = await request(app).get("/movies?limit=500");
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toEqual({
      field: "limit",
      message: "limit must be between 1 and 100",
    });
  });

  it("GET /movies/:id rejects an id that isn't a UUID", async () => {
    const res = await request(app).get("/movies/123");
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("id");
  });
});

describe("authentication guard", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/watchlist");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access denied. No token provided.");
  });

  it("rejects an invalid Bearer token", async () => {
    const res = await request(app)
      .get("/watchlist")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Invalid or expired token." });
  });

  it("reads the token from the cookie too", async () => {
    const res = await request(app)
      .get("/watchlist")
      .set("Cookie", "token=not-a-real-token");
    // "invalid", not "no token": the cookie was read
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Invalid or expired token." });
  });

  it("protects writes to movies", async () => {
    const res = await request(app)
      .post("/movies")
      .send({ title: "Inception", releaseYear: 2010 });
    expect(res.status).toBe(401);
  });
});

describe("API docs", () => {
  it("serves the OpenAPI spec with pagination params", async () => {
    const res = await request(app).get("/docs/openapi.json");
    expect(res.status).toBe(200);
    const params = res.body.paths["/movies"].get.parameters.map(
      (p: { name: string }) => p.name,
    );
    expect(params).toEqual(["page", "limit"]);
  });
});
