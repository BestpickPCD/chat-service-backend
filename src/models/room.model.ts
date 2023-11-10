import { Schema, model } from "mongoose";
import { IRoom } from "../types/models.js";

const NAME = {
  DOCUMENT: "Room",
  COLLECTION: "Rooms",
};
const RoomSchema = new Schema<IRoom>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
    },
    newGuestMessages: {
      type: Number,
      default: 0,
    },
    newUserMessages: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Rooms = model<IRoom>("Room", RoomSchema);
export default Rooms;
