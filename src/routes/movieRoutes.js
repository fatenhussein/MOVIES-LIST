import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ httpMethod: "Get movies" });
});

router.post("/", (req, res) => {
  res.json({ httpMethod: "pooooooost" });
});

router.get("/:id", (req, res) => {
  res.json({ httpMethod: "Get movie details" });
});

router.put("/:id", (req, res) => {
  res.json({ httpMethod: "Update movie details" });
});
router.delete("/:id", (req, res) => {
  res.json({ httpMethod: "Remove movie from favorites" });
});

export default router;
