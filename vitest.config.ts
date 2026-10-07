import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // set before the app loads; dotenv never overrides variables that are
    // already set, so tests don't depend on (or touch) the real database
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
