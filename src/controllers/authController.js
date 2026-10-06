import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  const userExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  //hash the password before saving it to the database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken(user.id, res);

  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
      name: name,
    },
    token,
  });

  // never send the password hash back to the client
  const { password: _, ...user } = newUser;

  res.status(201).json({ message: "User registered successfully", data: user });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // generate jwt token
  const token = generateToken(user.id, res);

  // never send the password hash back to the client
  const { password: _, ...userWithoutPassword } = user;

  res
    .status(200)
    .json({ message: "Login successful", data: userWithoutPassword, token });
};

export const logoutUser = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
};
