# Movies List API

A REST API for browsing movies and keeping a personal watchlist. Users can register, log in, add movies to the catalogue, and track what they plan to watch, are watching, or have finished, with ratings and notes.

Interactive API docs (Swagger UI) are served at **`/docs`**.

## Tech stack

| Area         | Tools                                          |
| ------------ | ---------------------------------------------- |
| Runtime      | Node.js, TypeScript, Express 5                 |
| Database     | PostgreSQL, Prisma 7 (with the `pg` adapter)   |
| Auth         | JWT (Bearer header or httpOnly cookie), bcrypt |
| Validation   | Zod                                            |
| Docs         | OpenAPI 3.1 + Swagger UI                       |
| Code quality | ESLint (typescript-eslint), Prettier           |

## Features

- **Authentication:** register and log in with JWTs. The token is returned in the response body and also set as an httpOnly, `sameSite=strict` cookie. Passwords are hashed with bcrypt and never returned.
- **Ownership checks:** only the user who created a movie can update or delete it, and users can only change their own watchlist items (`403` otherwise).
- **Request validation:** every body and `:id` param is checked with Zod, and errors come back as a list of `{ field, message }`.
- **Docs generated from validators:** the OpenAPI request schemas are built from the same Zod schemas the API uses, so the docs stay in sync with the code.
- **Consistent JSON errors:** unknown routes return `404` and unexpected errors return JSON instead of HTML. Internal details are hidden in production.
- **Graceful shutdown:** the database connection is closed cleanly on `SIGTERM` and on fatal errors.

## Getting started

### Prerequisites

- Node.js 20.19 or newer
- A PostgreSQL database (local, Docker, or hosted)

### 1. Install

```bash
git clone https://github.com/fatenhussein/MOVIES-LIST.git
cd MOVIES-LIST
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable       | Description                            |
| -------------- | -------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string           |
| `JWT_SECRET`   | Long random string used to sign tokens |
| `NODE_ENV`     | `development` or `production`          |
| `PORT`         | Port to listen on (default `3001`)     |

### 3. Set up the database

```bash
npx prisma migrate dev     # create the tables and generate the Prisma client
npm run seed:movies        # optional: add a demo user and 8 sample movies
```

The seed creates a demo user you can log in with: `demo@example.com` / `password123`.

### 4. Run

```bash
npm run dev                # start with hot reload on http://localhost:3001
```

Open **http://localhost:3001/docs** to try the endpoints in your browser. Log in, click **Authorize**, and paste the token.

For production:

```bash
npm run build && npm start
```

## API endpoints

🔒 = requires `Authorization: Bearer <token>` (or the auth cookie)

### Auth

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | `/auth/register` | Create an account        |
| POST   | `/auth/login`    | Log in and receive a JWT |
| POST   | `/auth/logout`   | Clear the auth cookie    |

### Movies

| Method | Endpoint      | Description                   |     |
| ------ | ------------- | ----------------------------- | --- |
| GET    | `/movies`     | List all movies, newest first |     |
| GET    | `/movies/:id` | Get one movie                 |     |
| POST   | `/movies`     | Create a movie                | 🔒  |
| PUT    | `/movies/:id` | Update a movie you created    | 🔒  |
| DELETE | `/movies/:id` | Delete a movie you created    | 🔒  |

### Watchlist

| Method | Endpoint         | Description                             |     |
| ------ | ---------------- | --------------------------------------- | --- |
| GET    | `/watchlist`     | Your watchlist, including movie details | 🔒  |
| POST   | `/watchlist`     | Add a movie                             | 🔒  |
| PUT    | `/watchlist/:id` | Update status, rating (1–10), or notes  | 🔒  |
| DELETE | `/watchlist/:id` | Remove a movie from your watchlist      | 🔒  |

Watchlist status is one of `PLANNED`, `WATCHING`, `COMPLETED`, `DROPPED`.

### Example

```bash
# log in
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# add a movie to your watchlist
curl -X POST http://localhost:3001/watchlist \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"movieId":"<movie-id>","status":"PLANNED"}'
```

Validation errors look like this:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "rating", "message": "rating must be between 1 and 10" }
  ]
}
```

## Data model

```
User ─┬─< Movie            (a user creates movies)
      └─< WatchlistItem >── Movie
```

- A `WatchlistItem` links a user to a movie and is unique per `(userId, movieId)`.
- Deleting a user or movie cascades to its watchlist items.

## Project structure

```
prisma/
  schema.prisma        database models
  migrations/          SQL migrations
  seed.ts              demo data
src/
  config/db.ts         Prisma client and connection helpers
  controllers/         request handlers
  docs/openapi.ts      OpenAPI spec (request schemas generated from Zod)
  middleware/          auth, validation, error handling
  routes/              Express routers
  validators/          Zod schemas and inferred input types
  server.ts            app entry point
```

## Scripts

| Script                | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start with hot reload (`tsx watch`)               |
| `npm run build`       | Generate the Prisma client and compile to `dist/` |
| `npm start`           | Run the compiled build                            |
| `npm run typecheck`   | Type-check without emitting files                 |
| `npm run db:migrate`  | Run `prisma migrate dev`                          |
| `npm run seed:movies` | Seed the demo user and sample movies              |
| `npm run lint`        | Lint with ESLint                                  |
| `npm run format`      | Format with Prettier                              |
