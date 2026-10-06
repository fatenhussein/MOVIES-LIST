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

export const getWatchlist = async (req, res) => {
  const watchlist = await prisma.watchlistItem.findMany({
    where: { userId: req.user.id },
    include: { movie: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ data: watchlist });
};

export const updateWatchlistItem = async (req, res) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return res.status(404).json({ message: "Watchlist item not found" });
  }

  if (watchlistItem.userId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You can only update your own watchlist items" });
  }

  const { status, rating, notes } = req.body;

  const updatedItem = await prisma.watchlistItem.update({
    where: { id: req.params.id },
    data: { status, rating, notes },
  });

  res
    .status(200)
    .json({ message: "Watchlist item updated", data: updatedItem });
};

export const removeFromWatchlist = async (req, res) => {
  const watchlistItem = await prisma.watchlistItem.findUnique({
    where: { id: req.params.id },
  });

  if (!watchlistItem) {
    return res.status(404).json({ message: "Watchlist item not found" });
  }

  if (watchlistItem.userId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You can only remove your own watchlist items" });
  }

  await prisma.watchlistItem.delete({
    where: { id: req.params.id },
  });

  res.status(200).json({ message: "Movie removed from watchlist" });
};
