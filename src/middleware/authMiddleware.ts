import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/db.ts";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    const { name, message } = error as Error;
    console.error("Auth error:", name, message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;
