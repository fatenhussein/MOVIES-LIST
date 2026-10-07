import express from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.ts";
import authMiddleware from "../middleware/authMiddleware.ts";
import { validateRequest } from "../middleware/validateRequest.ts";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../validators/movieValidators.ts";
import {
  idParamSchema,
  paginationSchema,
} from "../validators/commonValidators.ts";

const router = express.Router();

const validateId = validateRequest(idParamSchema, "params");

router.get("/", validateRequest(paginationSchema, "query"), getMovies);
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
