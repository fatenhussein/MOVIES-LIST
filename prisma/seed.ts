import { prisma } from "../src/config/db.ts";

// Replace with the id of an existing user in your database
const creatorId = "c8ffecb1-d02d-4acd-b7f5-f18f1423b1dc";

const movies = [
  {
    title: "The Matrix",
    overview: "A computer hacker learns about the true nature of reality.",
    releaseYear: 1999,
    genres: ["Action", "Sci-Fi"],
    runtime: 136,
    posterUrl: "https://example.com/matrix.jpg",
    createdBy: creatorId,
  },
  {
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through dream-sharing technology.",
    releaseYear: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    posterUrl: "https://example.com/inception.jpg",
    createdBy: creatorId,
  },
  {
    title: "The Dark Knight",
    overview: "Batman faces the Joker, a criminal mastermind who wants chaos.",
    releaseYear: 2008,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    posterUrl: "https://example.com/dark-knight.jpg",
    createdBy: creatorId,
  },
  {
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space to save humanity.",
    releaseYear: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    posterUrl: "https://example.com/interstellar.jpg",
    createdBy: creatorId,
  },
  {
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, and others intertwine.",
    releaseYear: 1994,
    genres: ["Crime", "Drama"],
    runtime: 154,
    posterUrl: "https://example.com/pulp-fiction.jpg",
    createdBy: creatorId,
  },
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over years, finding redemption.",
    releaseYear: 1994,
    genres: ["Drama"],
    runtime: 142,
    posterUrl: "https://example.com/shawshank.jpg",
    createdBy: creatorId,
  },
  {
    title: "Spirited Away",
    overview:
      "A girl wanders into a world ruled by gods, witches, and spirits.",
    releaseYear: 2001,
    genres: ["Animation", "Adventure", "Fantasy"],
    runtime: 125,
    posterUrl: "https://example.com/spirited-away.jpg",
    createdBy: creatorId,
  },
  {
    title: "Parasite",
    overview: "A poor family schemes to become employed by a wealthy family.",
    releaseYear: 2019,
    genres: ["Comedy", "Drama", "Thriller"],
    runtime: 132,
    posterUrl: "https://example.com/parasite.jpg",
    createdBy: creatorId,
  },
];

const main = async () => {
  console.log("Seeding movies...");

  for (const movie of movies) {
    await prisma.movie.create({ data: movie });
    console.log(`Created movie: ${movie.title}`);
  }

  console.log("Seeding completed!");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
