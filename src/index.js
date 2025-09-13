import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import usersRouter from "./routes/users.route.js";
import pollsRouter from "./routes/polls.route.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("io", io);

app.use("/api/user", usersRouter);
app.use("/api/polls", pollsRouter);

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  socket.on("join_poll", ({ pollId }) => socket.join(`poll_${pollId}`));
  socket.on("leave_poll", ({ pollId }) => socket.leave(`poll_${pollId}`));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
