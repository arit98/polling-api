import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { ApiError } from "../lib/ApiError.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "Missing Authorization header" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new ApiError(401, "Invalid token");

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    throw new ApiError(401, "Unauthorized");
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

export const loginUserExists = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(404, "User not logged in");
    }

    next();
  } catch (error) {
    next(error);
  }
};