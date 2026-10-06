import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { connectDB, disconnectDB } from "./config/db.ts";
import { openApiSpec } from "./docs/openapi.ts";
import { errorHandler, notFound } from "./middleware/errorHandler.ts";
// import routes
import movieRoutes from "./routes/movieRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import watchlistRoutes from "./routes/watchlistRoute.ts";

connectDB();
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);

// API docs
app.get("/docs/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// keep last: 404 for unknown routes, then JSON error responses
app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown on SIGTERM (e.g., when the hosting platform stops the app)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
