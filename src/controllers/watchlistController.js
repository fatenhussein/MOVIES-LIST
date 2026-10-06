import { prisma } from "../config/db.js";

export const addToWatchlist = async (req, res) => {
  const { movieId, status, rating, notes } = req.body;
  const userId = req.user.id;

  const movieExists = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });

  if (!movieExists) {
    return res.status(404).json({ message: "Movie not found" });
  }

  // check if already in watchlist
  const watchlistEntry = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId,
      },
    },
  });

  if (watchlistEntry) {
    return res.status(400).json({ message: "Movie already in watchlist" });
  }

  const newWatchlistEntry = await prisma.watchlistItem.create({
    data: {
      userId,
      movieId,
      status,
      rating,
      notes,
    },
  });

  res
    .status(201)
    .json({ message: "Movie added to watchlist", data: newWatchlistEntry });
};
