import { prisma } from "../config/db.js";

export const getMovies = async (req, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ data: movies });
};

export const getMovieById = async (req, res) => {
  const movie = await prisma.movie.findUnique({
    where: { id: req.params.id },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  res.status(200).json({ data: movie });
};

export const createMovie = async (req, res) => {
  const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;

  if (!title || !releaseYear) {
    return res
      .status(400)
      .json({ message: "title and releaseYear are required" });
  }

  const movie = await prisma.movie.create({
    data: {
      title,
      overview,
      releaseYear,
      genres,
      runtime,
      posterUrl,
      createdBy: req.user.id,
    },
  });

  res.status(201).json({ message: "Movie created", data: movie });
};

export const updateMovie = async (req, res) => {
  const movie = await prisma.movie.findUnique({
    where: { id: req.params.id },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  if (movie.createdBy !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You can only update movies you created" });
  }

  const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;

  const updatedMovie = await prisma.movie.update({
    where: { id: req.params.id },
    data: { title, overview, releaseYear, genres, runtime, posterUrl },
  });

  res.status(200).json({ message: "Movie updated", data: updatedMovie });
};

export const deleteMovie = async (req, res) => {
  const movie = await prisma.movie.findUnique({
    where: { id: req.params.id },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  if (movie.createdBy !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You can only delete movies you created" });
  }

  await prisma.movie.delete({
    where: { id: req.params.id },
  });

  res.status(200).json({ message: "Movie deleted" });
};
