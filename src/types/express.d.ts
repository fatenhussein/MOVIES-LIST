import type { User } from "../generated/prisma/client.ts";

// authMiddleware attaches the logged-in user to the request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
