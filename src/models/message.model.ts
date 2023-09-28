import { Schema, model } from "mongoose";
import { IMessage } from "../types/models.js";

const NAME = {
  DOCUMENT: "Message",
  COLLECTION: "Messages",
};
const MessageSchema = new Schema<IMessage>(
  {
    userId: {
      type: Number,
      ref: "User",
    },
    text: String,
    oldText: String,
    image: Schema.Types.Mixed,
    oldImage: String,
    reaction: String,
    hasRead: Boolean,
    isUpdated: Boolean,
    isReply: Boolean,
    status: String,
    roomId: Schema.Types.ObjectId,
  },
  {
    timestamps: true,
    collection: NAME.COLLECTION,
  }
);
const Messages = model<IMessage>(NAME.DOCUMENT, MessageSchema);
export default Messages;
