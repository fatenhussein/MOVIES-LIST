import express from "express";
import { addToWatchlist } from "../controllers/watchlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addToWatchlist);

router.get("/", (req, res) => {
  res.json({ httpMethod: "Get watchlist" });
});
export default router;
