import bcrypt from "bcryptjs";

import { prisma } from "../src/config/db.ts";

// Movies are created by this demo user, so you can log in as it and
// try the update/delete endpoints right away
const demoUser = {
  email: "demo@example.com",
  password: "password123",
  name: "Demo User",
};

const movies = [
  {
    title: "The Matrix",
    overview: "A computer hacker learns about the true nature of reality.",
    releaseYear: 1999,
    genres: ["Action", "Sci-Fi"],
    runtime: 136,
    posterUrl: "https://example.com/matrix.jpg",
  },
  {
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through dream-sharing technology.",
    releaseYear: 2010,
    genres: ["Action", "Sci-Fi", "Thriller"],
    runtime: 148,
    posterUrl: "https://example.com/inception.jpg",
  },
  {
    title: "The Dark Knight",
    overview: "Batman faces the Joker, a criminal mastermind who wants chaos.",
    releaseYear: 2008,
    genres: ["Action", "Crime", "Drama"],
    runtime: 152,
    posterUrl: "https://example.com/dark-knight.jpg",
  },
  {
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space to save humanity.",
    releaseYear: 2014,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    runtime: 169,
    posterUrl: "https://example.com/interstellar.jpg",
  },
  {
    title: "Pulp Fiction",
    overview: "The lives of two mob hitmen, a boxer, and others intertwine.",
    releaseYear: 1994,
    genres: ["Crime", "Drama"],
    runtime: 154,
    posterUrl: "https://example.com/pulp-fiction.jpg",
  },
  {
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over years, finding redemption.",
    releaseYear: 1994,
    genres: ["Drama"],
    runtime: 142,
    posterUrl: "https://example.com/shawshank.jpg",
  },
  {
    title: "Spirited Away",
    overview:
      "A girl wanders into a world ruled by gods, witches, and spirits.",
    releaseYear: 2001,
    genres: ["Animation", "Adventure", "Fantasy"],
    runtime: 125,
    posterUrl: "https://example.com/spirited-away.jpg",
  },
  {
    title: "Parasite",
    overview: "A poor family schemes to become employed by a wealthy family.",
    releaseYear: 2019,
    genres: ["Comedy", "Drama", "Thriller"],
    runtime: 132,
    posterUrl: "https://example.com/parasite.jpg",
  },
];

const main = async () => {
  const creator = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {},
    create: {
      email: demoUser.email,
      name: demoUser.name,
      password: await bcrypt.hash(demoUser.password, 10),
    },
  });
  console.log(`Demo user: ${demoUser.email} / ${demoUser.password}`);

  console.log("Seeding movies...");

  for (const movie of movies) {
    await prisma.movie.create({ data: { ...movie, createdBy: creator.id } });
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
