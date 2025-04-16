import { Server, Socket } from "socket.io";
import { Chat } from "../models/chat.model";

const setupChatSocket = (io: Server) => {
  // List of clients
  const users: Record<string, string> = {}; // key: value
  io.on("connection", (socket: Socket) => {
    // On connect
    console.log(`User connected: ${socket.id}`);

    // Listen to 'sendMessage' event
    socket.on("sendMessage", async (data) => {
      const { username, message, room } = data;

      try {
        // Save message to MongoDB
        const chat = new Chat({ username, message, room });
        await chat.save();

        // Broadcast the chat object to all connected clients via the newMessage event
        io.emit("newMessage", data);

        // For room-based broadcast
        // io.to(data.room).emit('newMessage', chat)
      } catch (error) {
        console.error("Error saving chat:", error);
      }
    });

    socket.emit("newMessage", {
      username: "System",
      message: "Welcome to our amazing newMessage! Have fun!",
    });

    socket.broadcast.emit("newMessage", {
      username: "System",
      message: `${socket.id} just joined chat. 😀`,
    });

    socket.on("join room", (data) => {
      socket.join(data.room);
      console.log(`${data.username} has joined ${data.room}`);

      io.to(data.room).emit("newMessage", {
        username: "System",
        message: `${data.username} joined the ${data.room}`,
        room: data.room,
      }); // to: 특정 룸에 보낼수있어
    });

    socket.on("leave room", (data) => {
      socket.leave(data.room);
      console.log(`${data.username} left ${data.room}`);
      io.to(data.room).emit("newMessage", {
        username: "System",
        message: `${data.username} has left chat.`,
        room: data.room,
      });
    });

    // On disconnect
    socket.on("disconnect", (data) => {
      console.log(`User disconnected: ${socket.id}`);
      io.emit("newMessage", {
        username: users[socket.id],
        message: "Left",
      });
    });
  });
};

export default setupChatSocket;
