import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/auth.js";

const router = express.Router();

// users routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/all").get(authenticate, authorizeAdmin, getUsers);
router.route("/:id").get(authenticate, getUser);
router.route("/:id").put(authenticate, updateUser);
router.route("/:id").delete(authenticate, authorizeAdmin, deleteUser);

export default router;
