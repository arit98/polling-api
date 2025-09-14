import { ApiError } from "../lib/ApiError.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import asyncHandler from "../lib/asyncHandler.js";
import prisma from "../lib/prisma.js";

const createVote = asyncHandler(async (req, res) => {
    try {
      const { question, creatorId, options } = req.body;
  
      if (!question || !creatorId || !Array.isArray(options))
        throw new ApiError(400, "Invalid input");

      const user = await prisma.user.findUnique({
        where: { id: Number(creatorId) },
      });
  
      if (!user) {
        throw new ApiError(404, "Creator not found");
      }
  
      const poll = await prisma.poll.create({
        data: {
          question,
          isPublished: true,
          creatorId: user.id,
          options: {
            create: options.map((opt, i) => ({
              text: typeof opt === "string" ? opt : opt.text,
              id: i+1,
            })),
          },
        },
        include: { options: true, creator: true },
      });
  
      res.json(new ApiResponse(201, poll, "Poll created successfully"));
    } catch (error) {
      console.log(error);
      throw new ApiError(500, "somthing went wrong when creating poll");
    }
  });

  const getPoll = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        options: { include: { votes: true } },
        creator: { select: { id: true, name: true } },
      },
    });
  
    if (!poll) throw new ApiError(404, "Poll not found");
  
    res.json(
      new ApiResponse(200,{
      id: poll.id,
      question: poll.question,
      creator: poll.creator,
      options: poll.options.map((o) => ({
        id: o.id,
        text: o.text,
        votes: o.votes.length,
      })),
    })
  );
  });
  
  const postVote = asyncHandler(async (req, res) => {
    try {
      const pollId = Number(req.params.pollId);
      const userId = req.user.id;
      const { optionId } = req.body;
  
      if (!optionId) throw new ApiError(400, "OptionId is required");
  
      // poll validation check
      const option = await prisma.pollOption.findUnique({
        where: {
          pollId_id: { pollId, id: Number(optionId) }
        }
      });

      if (!option || option.pollId !== pollId)
        throw new ApiError(400, "Invalid option");
  
      // user validation
      const existing = await prisma.vote.findUnique({
        where: { userId_pollId: { userId, pollId } },
      });
      if (existing) {
        throw new ApiError(400, "User has already voted in this poll");
      }
  
      // create a new vote
      const vote = await prisma.vote.create({
        data: { userId, pollId, optionId: Number(optionId)},
      });
  
      // recalculate
      const counts = await prisma.pollOption.findMany({
        where: { pollId },
        include: { votes: true },
      });
  
      const results = counts.map((o) => ({
        id: o.id,
        text: o.text,
        votes: o.votes.length,
      }));
  
      // emit realtime update
      const io = req.app.get("io");
      if (io) io.to(`poll_${pollId}`).emit("poll_updated", { pollId, results });
  
      res.json(new ApiResponse(201, {vote, results}, "Your vote posted"));
    } catch (error) {
      console.log(error)
      throw new ApiError(500, error.message || "Something went wrong");
    }
  });

  export {createVote, getPoll, postVote}