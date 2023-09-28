import { Schema, model } from "mongoose";
import { IRoom } from "../types/models.js";

const NAME = {
  DOCUMENT: "Room",
  COLLECTION: "Rooms",
};
const RoomSchema = new Schema<IRoom>(
  {
    userId: {
      type: Number,
      required: true,
      unique: true,
      ref: "User",
    },
    users: {
      type: Schema.Types.Array,
      ref: "User",
      default: [],
      required: true,
    },
    username: String,
    guess: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: NAME.COLLECTION,
  }
);
const Rooms = model<IRoom>(NAME.DOCUMENT, RoomSchema);
export default Rooms;
