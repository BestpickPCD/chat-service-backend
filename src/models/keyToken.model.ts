import { Schema, Types, model } from "mongoose";
import { IKeyToken } from "../types/models.ts";

const NAME = {
  DOCUMENT: "KeyToken",
  COLLECTION: "KeyTokens",
};
const KeyTokenSchema = new Schema<IKeyToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      maxLength: 150,
      ref: "User",
    },
    publicKey: { type: String, required: true },
    privateKey: { type: String, required: true },
    refreshTokenUsed: {
      type: Array,
      default: [],
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: NAME.COLLECTION,
  }
);
const KeyTokens = model<IKeyToken>(NAME.DOCUMENT, KeyTokenSchema);
export default KeyTokens;
