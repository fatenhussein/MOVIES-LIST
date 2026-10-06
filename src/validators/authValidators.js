import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("email must be a valid email address").trim().toLowerCase(),
  password: z.string().min(6, "password must be at least 6 characters"),
  name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.email("email must be a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "password is required"),
});
