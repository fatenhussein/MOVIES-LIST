import { z } from "zod";

const email = z
  .string({ error: "email is required" })
  .trim()
  .toLowerCase()
  .pipe(z.email("email must be a valid email address"));

export const registerSchema = z.object({
  email,
  password: z
    .string({ error: "password is required" })
    .min(6, "password must be at least 6 characters"),
  name: z.string().trim().min(1).max(100).optional(),
});

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "password is required" })
    .min(1, "password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
