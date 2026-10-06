import express from "express";
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addToWatchlistSchema,
  updateWatchlistItemSchema,
} from "../validators/watchlistValidators.js";
import { idParamSchema } from "../validators/commonValidators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWatchlist);
router.post("/", validateRequest(addToWatchlistSchema), addToWatchlist);
router.put(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateWatchlistItemSchema),
  updateWatchlistItem,
);
router.delete(
  "/:id",
  validateRequest(idParamSchema, "params"),
  removeFromWatchlist,
);

export default router;
