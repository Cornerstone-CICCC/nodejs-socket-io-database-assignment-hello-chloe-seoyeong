import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import chatRouter from "./routes/chat.routes";
import chatScoket from "./sockets/chat.socket";
dotenv.config();

// Create server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);

// Create HTTP server and attach Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend url here (Astro, React, vanilla HTML)
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB and start server
if (!process.env.DATABASE_URL) {
  throw Error("Missing connection string");
}
const MONGO_URI = process.env.DATABASE_URL;
mongoose
  .connect(MONGO_URI, { dbName: "chatroom" })
  .then(() => {
    console.log(`Connected to MongoDB database`);

    // Start Socket.IO
    chatScoket(io);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });
