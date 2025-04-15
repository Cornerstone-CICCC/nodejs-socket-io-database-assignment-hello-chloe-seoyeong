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
      const { username, message } = data;
      console.log(username, message);

      try {
        // Save message to MongoDB
        const chat = new Chat({ username, message });
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
