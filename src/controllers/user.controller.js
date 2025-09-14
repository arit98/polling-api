import asyncHandler from "../lib/asyncHandler.js";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { ApiError } from "../lib/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../lib/ApiResponse.js";

// register
const registerUser = asyncHandler(async function name(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new ApiError(400, "All field required");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
    });
    res.json(
      new ApiResponse(201, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );
  } catch (error) {
    throw new ApiError(500, "somthing went wrong when creating user");
  }
});

// login
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "email and password required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const bcrypt = await import("bcrypt");
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1h" }
    );

    res.json(new ApiResponse(200, token, "Login successful"));
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Something went wrong");
  }
});

// get single user
const getUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(new ApiResponse(200, user));
});

// get single users
const getUsers = asyncHandler(async function name(req, res) {
  const user = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.json(new ApiResponse(200, user));
});

// update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body;

    // excisting user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        email: email ?? user.email,
        role: role ?? user.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(new ApiResponse(200, updatedUser, "User updated successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while updating user"
    );
  }
});

// delete user
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const id = Number(req.params.id);

    // existing user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await prisma.user.deleteMany({ where: { id } });

    res.json(new ApiResponse(200, "User deleted successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong deleting user"
    );
  }
});

export { registerUser, loginUser, getUser, getUsers, updateUser, deleteUser };
