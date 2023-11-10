import { Schema, model } from "mongoose";
import { IMessage } from "../types/models.js";

const NAME = {
  DOCUMENT: "Message",
  COLLECTION: "Messages",
};
const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: String,
      ref: "User",
    },
    text: String,
    oldText: String,
    images: Schema.Types.Mixed,
    files: Schema.Types.Mixed,
    oldImage: String,
    reaction: String,
    hasRead: Boolean,
    isUpdated: Boolean,
    isReply: Boolean,
    status: String,
    roomId: Schema.Types.ObjectId,
    sendBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Messages = model<IMessage>(NAME.DOCUMENT, MessageSchema);
export default Messages;
