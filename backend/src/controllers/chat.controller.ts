import { Request, Response } from "express";
import { Chat } from "../models/chat.model";

// Get all chats
const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }); // Sort by createdAt field
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

// Get chats by each room
const getRoomChats = async (req: Request<{ room: string }>, res: Response) => {
  const { room } = req.params;
  try {
    console.log(room);
    const chats = await Chat.find({ room });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

export default {
  getAllChats,
  getRoomChats,
};
