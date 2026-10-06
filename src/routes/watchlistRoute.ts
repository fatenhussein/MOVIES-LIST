import express from "express";
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} from "../controllers/watchlistController.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import {
  addToWatchlistSchema,
  updateWatchlistItemSchema,
} from "../validators/watchlistValidators.ts";
import { idParamSchema } from "../validators/commonValidators.ts";
import { validateRequest } from "../middleware/validateRequest.ts";

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
