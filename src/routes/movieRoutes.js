import express from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movieValidators.js";
import { idParamSchema } from "../validators/commonValidators.js";

const router = express.Router();

const validateId = validateRequest(idParamSchema, "params");

router.get("/", getMovies);
router.get("/:id", validateId, getMovieById);

router.post(
  "/",
  authMiddleware,
  validateRequest(createMovieSchema),
  createMovie,
);
router.put(
  "/:id",
  authMiddleware,
  validateId,
  validateRequest(updateMovieSchema),
  updateMovie,
);
router.delete("/:id", authMiddleware, validateId, deleteMovie);

export default router;
