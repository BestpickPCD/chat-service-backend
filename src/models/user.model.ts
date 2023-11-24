import { Schema, model } from "mongoose";
import { IUser } from "../types/models.js";

const NAME = {
  DOCUMENT: "User",
  COLLECTION: "Users",
};

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      unique: true,
    },
    userGroup: String,
    userCode: String,
    userDomain: String,
    username: {
      type: String,
      maxLength: 150,
    },
    password: {
      type: String,
      maxlength: 100,
      select: false,
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Users = model<IUser>("User", UserSchema);
export default Users;
