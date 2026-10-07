import express from "express";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { openApiSpec } from "./docs/openapi.ts";
import { errorHandler, notFound } from "./middleware/errorHandler.ts";
// import routes
import movieRoutes from "./routes/movieRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import watchlistRoutes from "./routes/watchlistRoute.ts";

// The app is built here and started in server.ts, so tests can import it
// without opening a port or connecting to the database
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);

// health check for hosting platforms
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// API docs
app.get("/docs/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// keep last: 404 for unknown routes, then JSON error responses
app.use(notFound);
app.use(errorHandler);

export default app;
