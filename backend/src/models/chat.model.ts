import mongoose, { Schema } from "mongoose";

export interface IChat {
  username: string;
  message: string;
  room: string;
}

const ChatSchema: Schema = new Schema<IChat>({
  username: { type: String, required: true },
  message: { type: String, required: true },
  room: { type: String },
});

export const Chat = mongoose.model("Chat", ChatSchema);
