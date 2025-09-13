import express from "express";
import { authenticate, authorizeAdmin } from "../middlewares/auth.js";
import { createVote, getPoll, postVote } from "../controllers/polls.controller.js";

const router = express.Router();

// polls routes
router.route("/create").post(authenticate, authorizeAdmin, createVote);
router.route("/:id").get(authenticate, getPoll);
router.route("/:pollId/vote").post(authenticate, postVote)

export default router;
