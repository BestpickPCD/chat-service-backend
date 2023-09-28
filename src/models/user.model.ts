import { Schema, model } from "mongoose";
import { IUser } from "../types/models.js";

const NAME = {
  DOCUMENT: "User",
  COLLECTION: "Users",
};
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      maxLength: 150,
    },
    name: {
      type: String,
      required: true,
      maxLength: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: NAME.COLLECTION,
  }
);
const Users = model<IUser>(NAME.DOCUMENT, UserSchema);
export default Users;
